const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const MasterOrder = require("../models/masterOrder");
const Payment = require("../models/payment");
const User = require("../models/user");
const razorpayInstance = require("../utils/razorpay");

exports.createPayment = async (req, res) => {
  try {
    const { masterOrderId } = req.body;

    const masterOrder = await MasterOrder.findById(masterOrderId);
    if (!masterOrder) {
      return res.status(404).json({ message: "Master order not found" });
    }

    if (masterOrder.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: Not your order" });
    }

    if (masterOrder.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    if (!masterOrder.totalAmount || masterOrder.totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    // IDEMPOTENCY CHECK   //TODO: later we can also add the idempotency key

    const existingPayment = await Payment.findOne({
      masterOrder: masterOrder._id,
    }).sort({ createdAt: -1 });

    if (existingPayment) {
      if (["paid", "success", "captured"].includes(existingPayment.status)) {
        return res
          .status(400)
          .json({ message: "Payment already completed for this order" });
      }
      if (
        ["created", "attempted", "authorized"].includes(existingPayment.status)
      ) {
        return res.status(200).json({
          message: "Payment already initialized",
          order: {
            id: existingPayment.razorpayOrderId,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            notes: existingPayment.notes,
          },
          keyId: process.env.RAZORPAY_KEY_ID,
        });
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

    const user = await User.findById(req.user.id).select("name email phone");

    await Payment.create({
      masterOrder: masterOrder._id,
      buyer: user,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: "created",
      notes: razorpayOrder.notes,
    });

    res.status(201).json({
      message: "Payment created successfully",
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      user,
    });
  } catch (error) {
    console.error("Create Payment Error:", {
      message: error.message,
      masterOrderId: req.body.masterOrderId,
    });
    res.status(500).json({
      message: "Something went wrong while creating payment",
    });
  }
};

exports.verifyPaymentWebhook = async (req, res) => {
  try {
    const webhookSignature = req.header("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Webhook signature is invalid!" });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    console.log(`Received Razorpay webhook event: ${event}`);

    let paymentRecord, masterOrderRecord;

    paymentRecord = await Payment.findOne({
      razorpayOrderId: payload.order_id,
    });
    if (!paymentRecord) {
      console.error(
        `Payment record not found for Razorpay Order ID: ${payload.order_id}`
      );
      return res.status(404).json({ message: "Payment record not found" });
    }

    masterOrderRecord = await MasterOrder.findById(paymentRecord.masterOrder);
    if (!masterOrderRecord) {
      console.error(
        `MasterOrder record not found for Payment ID: ${paymentRecord._id}`
      );
      return res.status(404).json({ message: "Master order not found" });
    }

    // Update Payment record
    paymentRecord.razorpayPaymentId = payload.id;
    paymentRecord.razorpaySignature = webhookSignature;
    paymentRecord.method = payload.method;
    paymentRecord.webhookPayload = req.body;

    if (event === "payment.captured") {
      paymentRecord.status = "captured";
      masterOrderRecord.paymentStatus = "paid";
      console.log(`Payment captured for MasterOrder: ${masterOrderRecord._id}`);
    } else if (event === "payment.failed") {
      paymentRecord.status = "failed";
      masterOrderRecord.paymentStatus = "failed";
      console.log(`Payment failed for MasterOrder: ${masterOrderRecord._id}`);
    }
    await paymentRecord.save();
    await masterOrderRecord.save();

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    // Razorpay retries if it doesn't receive a 2xx response.
    res.status(200).json({ received: true, error: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {};

// 1. add verify payment
// 2. Final : Refactor to Inventory Reservation concept
