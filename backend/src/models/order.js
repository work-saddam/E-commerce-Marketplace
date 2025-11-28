const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    masterOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterOrder",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      type: Object,
      required: true,
    },
    // shippingAddress: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Address",
    //   required: true,
    // },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subTotal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ buyer: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
