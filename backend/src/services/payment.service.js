const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const Payment = require("../models/payment");
const razorpayInstance = require("../utils/razorpay");
const User = require("../models/user");
const MasterOrder = require("../models/masterOrder");
const InventoryService = require("./inventory.service");
const OrderService = require("./order.service");

exports.createPayment = async (req, res) => {
  try {
    const { masterOrderId } = req.body;
    const userId = req.user.id;

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

    return res.status(201).json({
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
      process.env.RAZORPAY_WEBHOOK_SECRET,
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
        `Payment record not found for Razorpay Order ID: ${payload.order_id}`,
      );
      return res.status(404).json({ message: "Payment record not found" });
    }

    masterOrderRecord = await MasterOrder.findById(paymentRecord.masterOrder);
    if (!masterOrderRecord) {
      console.error(
        `MasterOrder record not found for Payment ID: ${paymentRecord._id}`,
      );
      return res.status(404).json({ message: "Master order not found" });
    }

    if (["captured", "failed"].includes(paymentRecord.status)) {
      return res.status(200).json({ received: true });
    }

    if (event === "payment.captured") {
      await this.handlePaymentCaptured({ paymentRecord, payload });
    }

    if (event === "payment.failed") {
      await this.handlePaymentFailed({ paymentRecord, payload });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    // Razorpay retries if it doesn't receive a 2xx response.
    res.status(200).json({
      received: true,
      error: `Internal Server Error || ${error.message}`,
    });
  }
};

exports.handlePaymentCaptured = async ({ paymentRecord, payload }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const masterOrder = await MasterOrder.findById(
      paymentRecord.masterOrder,
    ).session(session);

    await this.markSuccess(paymentRecord, payload, session);

    await InventoryService.confirmInventory(masterOrder._id, session);

    await OrderService.confirmOrders(masterOrder._id, session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.handlePaymentFailed = async ({ paymentRecord, payload }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const masterOrder = await MasterOrder.findById(
      paymentRecord.masterOrder,
    ).session(session);

    await this.markFailed(
      paymentRecord,
      {
        razorpayPaymentId: payload?.id,
        method: payload?.method,
        webhookPayload: payload,
        reason: payload.error_description || "payment_failed",
      },
      session,
    );

    await InventoryService.releaseInventory(masterOrder._id, session);

    await OrderService.failOrders(masterOrder._id, session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.markSuccess = async (paymentRecord, payload, session) => {
  paymentRecord.status = "captured";
  paymentRecord.razorpayPaymentId = payload.id;
  paymentRecord.method = payload.method;
  paymentRecord.webhookPayload = payload;

  await paymentRecord.save({ session });
};

const withSession = (session) => (session ? { session } : {});

exports.markFailed = async (paymentRecord, data = {}, session = null) => {
  // IDEMPOTENCY GUARD
  if (paymentRecord.status === "failed") {
    return;
  }

  paymentRecord.status = "failed";

  if (data.razorpayPaymentId) {
    paymentRecord.razorpayPaymentId = data.razorpayPaymentId;
  }

  if (data.method) {
    paymentRecord.method = data.method;
  }

  // Store context safely
  paymentRecord.failureReason =
    data.reason || data.failureReason || "payment_failed";

  if (data.webhookPayload) {
    paymentRecord.webhookPayload = data.webhookPayload;
  }

  await paymentRecord.save(withSession(session));
};

exports.markAuthorized = async (payment, data) => {
  payment.status = "authorized";
  payment.razorpayPaymentId = data.razorpay_payment_id;
  payment.razorpaySignature = data.razorpay_signature;
  payment.method = data.method;

  await payment.save();
};
