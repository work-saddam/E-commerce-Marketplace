const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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

    // Razorpay identifiers
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
    },
    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "refunded",
        "failed",
        "attempted",
        "paid",
        "success",
      ],
      default: "created",
    },

    method: String, // card, upi, netbanking
    notes: Object,
    webhookPayload: Object, // RAW webhook data
  },
  { timestamps: true }
);

paymentSchema.index({ masterOrder: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
