const Order = require("../models/order");
const Product = require("../models/product");

exports.reserveInventory = async (cart, session) => {
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
  const orders = await Order.find({ masterOrder: masterOrderId }).session(
    session,
  );

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
    await Product.bulkWrite(bulkOps, { session });
  }
};

exports.releaseInventory = async (masterOrderId, session) => {
  const orders = await Order.find({ masterOrder: masterOrderId }).session(
    session,
  );

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
    await Product.bulkWrite(bulkOps, { session });
  }
};
