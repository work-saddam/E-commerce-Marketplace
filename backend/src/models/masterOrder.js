const mongoose = require("mongoose");

const masterOrderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    reservationExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

masterOrderSchema.index({ reservationExpiresAt: 1 });

const MasterOrder = mongoose.model("MasterOrder", masterOrderSchema);
module.exports = MasterOrder;
