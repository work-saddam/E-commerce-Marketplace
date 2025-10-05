const MasterOrder = require("../models/masterOrder");
const Order = require("../models/order");
const Product = require("../models/product");

const placeOrder = async (req, res) => {
  try {
    const { cart, addressId, paymentMethod } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart was empty!" });
    }

    if (!addressId) {
      return res.status(400).json({ message: "Shipping address is required!" });
    }

    const sellerMap = {};
    let totalAmount = 0;

    for (const item of cart) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: "Product not found!" });
      }

      if (item.quantity > product.stock) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.title}` });
      }

      const subTotal = product.price * item.quantity;
      totalAmount += subTotal;

      if (!sellerMap[product.seller]) {
        sellerMap[product.seller] = [];
      }
      sellerMap[product.seller].push({
        product: product._id,
        price: product.price,
        quantity: item.quantity,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const masterOrder = await MasterOrder.create({
      buyer: req.user.id,
      paymentMethod,
      totalAmount,
    });

    const orderIds = [];

    for (const sellerId in sellerMap) {
      const sellerProducts = sellerMap[sellerId];
      const subTotal = sellerProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );

      const subOrder = await Order.create({
        masterOrder: masterOrder._id,
        buyer: req.user.id,
        seller: sellerId,
        products: sellerProducts,
        shippingAddress: addressId,
        subTotal,
      });

      orderIds.push(subOrder._id);
    }

    masterOrder.orders = orderIds;
    await masterOrder.save();

    res
      .status(201)
      .json({ message: "Order placed successfully!", data: masterOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Order placement failed", error: error.message });
  }
};

module.exports = { placeOrder };
