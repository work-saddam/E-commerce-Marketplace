const Product = require("../models/product");

exports.reserveInventory = async (cart, session) => {
  for (const item of cart) {
    const result = await Product.updateOne(
      {
        _id: item._id,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { reservedStock: item.quantity },
      },
      { session },
    );

    if (result.modifiedCount !== cart.length) {
      await session.abortTransaction();
      throw new Error(`Insufficient stock for product ${item._id}`);
    }
  }
};

exports.confirmInventory = async (cart) => {
  for (const item of cart) {
    await Product.updateOne(
      { _id: item._id },
      {
        $inc: {
          stock: -item.quantity,
          reservedStock: -item.quantity,
        },
      },
    );
  }
};

exports.releaseInventory = async (cart) => {
  for (const item of cart) {
    await Product.updateOne(
      { _id: item._id },
      { $inc: { reservedStock: -item.quantity } },
    );
  }
};
