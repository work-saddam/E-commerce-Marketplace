const mongoose = require("mongoose");
const Address = require("../models/address");
const MasterOrder = require("../models/masterOrder");
const Order = require("../models/order");
const Product = require("../models/product");

exports.createOrder = async ({
  buyerId,
  cart,
  addressId,
  paymentMethod,
  session,
}) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    await session.abortTransaction();
    throw new Error("Cart should not be empty");
  }

  if (!addressId) {
    await session.abortTransaction();
    throw new Error("Address is required");
  }

  const userAddress = await Address.findOne({
    _id: addressId,
    user: buyerId,
  })
    .select("-isDefault -createdAt -updatedAt -__v -_id")
    .session(session);
  if (!userAddress) {
    await session.abortTransaction();
    throw new Error("Invalid address");
  }

  for (const item of cart) {
    item.quantity = Number(item.quantity);
    if (isNaN(item.quantity) || item.quantity <= 0) {
      await session.abortTransaction();
      throw new Error(`Invalid quantity for product ${item._id}`);
    }
  }

  const productIds = cart.map((item) => item._id);
  const products = await Product.find({ _id: { $in: productIds } }).session(
    session,
  );
  const productMap = new Map(products.map((pro) => [pro._id.toString(), pro]));

  const sellerMap = {};
  let totalAmount = 0;

  for (let item of cart) {
    const product = productMap.get(item._id);
    if (!product) {
      await session.abortTransaction();
      throw new Error(`Product not found: ${item._id}`);
    }

    if (item.quantity > product.stock) {
      await session.abortTransaction();
      throw new Error(`Insufficient stock for product ${product.title}`);
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

  if (!totalAmount || totalAmount <= 0) {
    await session.abortTransaction();
    throw new Error("Invalid order total amount");
  }

  const [masterOrder] = await MasterOrder.create(
    [
      {
        buyer: buyerId,
        paymentMethod,
        totalAmount,
      },
    ],
    { session },
  );

  const orderIds = [];

  for (const sellerId in sellerMap) {
    const sellerProducts = sellerMap[sellerId];
    const subTotal = sellerProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );

    const subOrder = await Order.create(
      [
        {
          masterOrder: masterOrder._id,
          buyer: buyerId,
          seller: sellerId,
          products: sellerProducts,
          shippingAddress: userAddress,
          subTotal,
        },
      ],
      { session },
    );

    orderIds.push(subOrder[0]._id);
  }

  masterOrder.orders = orderIds;
  await masterOrder.save({ session });

  return masterOrder;
};
