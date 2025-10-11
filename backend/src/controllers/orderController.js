const Address = require("../models/address");
const MasterOrder = require("../models/masterOrder");
const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cart, addressId, paymentMethod } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ messsage: "Cart should not be empty!" });
    }

    if (!addressId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Address is required!" });
    }

    const isValidAddress = await Address.findOne({
      _id: addressId,
      user: req.user.id,
    }).session(session);
    if (!isValidAddress) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Invalid address" });
    }

    for (const item of cart) {
      item.quantity = Number(item.quantity);
      if (isNaN(item.quantity) || item.quantity <= 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: `Invalid quantity for product ${item._id}` });
      }
    }

    const productIds = cart.map((item) => item._id);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );
    const productMap = new Map(
      products.map((pro) => [pro._id.toString(), pro])
    );

    const sellerMap = {};
    let totalAmount = 0;

    for (let item of cart) {
      const product = productMap.get(item._id);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Product not found" });
      }

      if (item.quantity > product.stock) {
        await session.abortTransaction();
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
    }

    const bulkOps = cart.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const bulkResult = await Product.bulkWrite(bulkOps, { session });

    if (bulkResult.modifiedCount !== cart.length) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Stock update failed. Please try again." });
    }

    const masterOrder = await MasterOrder.create(
      [
        {
          buyer: req.user.id,
          paymentMethod,
          totalAmount,
        },
      ],
      { session }
    );

    const masterOrderDoc = masterOrder[0];
    const orderIds = [];

    for (const sellerId in sellerMap) {
      const sellerProducts = sellerMap[sellerId];
      const subTotal = sellerProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );

      const subOrder = await Order.create(
        [
          {
            masterOrder: masterOrderDoc._id,
            buyer: req.user.id,
            seller: sellerId,
            products: sellerProducts,
            shippingAddress: addressId,
            subTotal,
          },
        ],
        { session }
      );

      orderIds.push(subOrder[0]._id);
    }

    masterOrderDoc.orders = orderIds;
    await masterOrderDoc.save({ session });

    await session.commitTransaction();

    res
      .status(201)
      .json({ message: "Order placed successfully!", data: masterOrderDoc });
  } catch (error) {
    await session.abortTransaction();
    return res
      .status(500)
      .json({ message: "Order placement failed!", error: error.message });
  } finally {
    session.endSession();
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate({
        path: "products",
        populate: {
          path: "product",
          model: "Product",
          select: "title image",
        },
      })
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Order fetched successfully!", data: orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Order fetch failed!", error: error.message });
  }
};

//Add getSellerOrder
// Add updateOrderStatus

module.exports = { placeOrder, getUserOrders };
