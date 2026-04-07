const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const Payment = require("../models/payment");
const razorpayInstance = require("../utils/razorpay");
const User = require("../models/user");
const MasterOrder = require("../models/masterOrder");

exports.createPayment = async (masterOrderId, userId) => {
  try {
    const masterOrder = await MasterOrder.findById(masterOrderId);
    if (!masterOrder) {
      throw new Error("Master order not found");
    }

    if (masterOrder.buyer.toString() !== userId) {
      throw new Error("Unauthorized: Not your order");
    }

    if (masterOrder.paymentStatus === "paid") {
      throw new Error("Order already paid");
    }

    if (!masterOrder.totalAmount || masterOrder.totalAmount <= 0) {
      throw new Error("Invalid order amount");
    }

    // IDEMPOTENCY CHECK   //TODO: later we can also add the idempotency key

    const existingPayment = await Payment.findOne({
      masterOrder: masterOrder._id,
    }).sort({ createdAt: -1 });

    if (existingPayment) {
      if (["paid", "success", "captured"].includes(existingPayment.status)) {
        throw new Error("Payment already completed for this order");
      }
      if (
        ["created", "attempted", "authorized"].includes(existingPayment.status)
      ) {
        return {
          message: "Payment already initialized",
          order: {
            id: existingPayment.razorpayOrderId,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            notes: existingPayment.notes,
          },
          keyId: process.env.RAZORPAY_KEY_ID,
        };
      }

      // If failed / cancelled / expired → allow retry by creating new Razorpay order
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(masterOrder.totalAmount * 100),
      currency: "INR",
      receipt: `receipt#${masterOrder._id}`,
      notes: {
        masterOrderId: masterOrder._id.toString(),
        buyerId: masterOrder.buyer.toString(),
        orderIds: masterOrder.orders,
      },
    });

    const user = await User.findById(userId).select("name email phone");

    await Payment.create({
      masterOrder: masterOrder._id,
      buyer: user,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: "created",
      notes: razorpayOrder.notes,
    });

    return {
      message: "Payment created successfully",
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      user,
    };
  } catch (error) {
    console.error("Create Payment Error:", {
      message: error.message,
      masterOrderId: req.body.masterOrderId,
    });
    throw new Error("Something went wrong while creating payment", error);
  }
};
