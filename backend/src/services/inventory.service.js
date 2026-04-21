const Order = require("../models/order");
const Product = require("../models/product");

exports.reserveInventory = async (cart, session) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    await session.abortTransaction();
    throw new Error("Invalid cart");
  }

  for (const item of cart) {
    const result = await Product.updateOne(
      {
        _id: item._id,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity, reservedStock: item.quantity },
      },
      { session },
    );

    if (result.modifiedCount !== 1) {
      await session.abortTransaction();
      throw new Error(`Insufficient stock for product ${item._id}`);
    }
  }
};

exports.confirmInventory = async (masterOrderId, session) => {
  const orders = await Order.find({
    masterOrder: masterOrderId,
    orderStatus: "PENDING",
  }).session(session);

  const bulkOps = [];

  for (const order of orders) {
    for (const item of order.products) {
      bulkOps.push({
        updateOne: {
          filter: {
            _id: item.product,
            reservedStock: { $gte: item.quantity },
          },
          update: {
            $inc: {
              reservedStock: -item.quantity,
            },
          },
        },
      });
    }
  }

  if (bulkOps.length) {
    const result = await Product.bulkWrite(bulkOps, { session });
    if (
      result.matchedCount !== bulkOps.length ||
      result.modifiedCount !== bulkOps.length
    ) {
      throw new Error(
        `Inventory confirmation failed for masterOrder ${masterOrderId}. ` +
          `Expected ${bulkOps.length}, matched ${result.matchedCount}, modified ${result.modifiedCount}`,
      );
    }
  }
};

exports.releaseInventory = async (masterOrderId, session) => {
  const orders = await Order.find({
    masterOrder: masterOrderId,
    orderStatus: "PENDING",
  }).session(session);

  const bulkOps = [];

  for (const order of orders) {
    for (const item of order.products) {
      bulkOps.push({
        updateOne: {
          filter: { _id: item.product, reservedStock: { $gte: item.quantity } },
          update: {
            $inc: {
              stock: item.quantity,
              reservedStock: -item.quantity,
            },
          },
        },
      });
    }
  }

  if (bulkOps.length) {
    const result = await Product.bulkWrite(bulkOps, { session });
    if (
      result.matchedCount !== bulkOps.length ||
      result.modifiedCount !== bulkOps.length
    ) {
      throw new Error(
        `Inventory release failed for masterOrder ${masterOrderId}. ` +
          `Expected ${bulkOps.length}, matched ${result.matchedCount}, modified ${result.modifiedCount}`,
      );
    }
  }
};
