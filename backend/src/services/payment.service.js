const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const mongoose = require("mongoose");
const Payment = require("../models/payment");
const razorpayInstance = require("../utils/razorpay");
const User = require("../models/user");
const MasterOrder = require("../models/masterOrder");
const {
  AUTHORIZED_PAYMENT_GRACE_MS,
  getReservationExpiryDate,
  isReservationExpired,
} = require("../config/orderReservation");
const {
  addReleaseInventoryJob,
  removeReleaseInventoryJob,
} = require("../jobs/inventory/releaseInventory");
const InventoryService = require("./inventory.service");
const OrderService = require("./order.service");
const TransactionalMailService = require("./transactionalMail.service");

const SUCCESS_PAYMENT_STATUSES = ["captured", "paid", "success"];
const ACTIVE_PAYMENT_STATUSES = ["created", "attempted", "authorized"];

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

exports.createPayment = async (req, res) => {
  try {
    const { masterOrderId } = req.body;
    const userId = req.user.id;

    const masterOrder = await MasterOrder.findById(masterOrderId);
    if (!masterOrder) {
      throw createHttpError(404, "Master order not found");
    }

    if (masterOrder.buyer.toString() !== userId) {
      throw createHttpError(403, "Unauthorized: Not your order");
    }

    if (masterOrder.paymentMethod !== "Razorpay") {
      throw createHttpError(
        400,
        "Online payment is not available for this order",
      );
    }

    if (masterOrder.paymentStatus === "paid") {
      throw createHttpError(409, "Order already paid");
    }

    if (masterOrder.paymentStatus === "failed") {
      throw createHttpError(409, "Payment window expired for this order");
    }

    if (isReservationExpired(masterOrder.reservationExpiresAt)) {
      try {
        await addReleaseInventoryJob(masterOrder._id.toString(), 0);
      } catch (jobError) {
        console.error("Failed to enqueue immediate reservation cleanup:", {
          masterOrderId,
          message: jobError.message,
        });
      }

      throw createHttpError(409, "Payment window expired for this order");
    }

    if (!masterOrder.totalAmount || masterOrder.totalAmount <= 0) {
      throw createHttpError(400, "Invalid order amount");
    }

    // IDEMPOTENCY CHECK   //TODO: later we can also add the idempotency key

    const existingPayment = await Payment.findOne({
      masterOrder: masterOrder._id,
    }).sort({ createdAt: -1 });

    if (existingPayment) {
      if (SUCCESS_PAYMENT_STATUSES.includes(existingPayment.status)) {
        return res
          .status(409)
          .json({ message: "Payment already completed for this order" });
      }

      if (ACTIVE_PAYMENT_STATUSES.includes(existingPayment.status)) {
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
      buyer: userId,
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
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong while creating payment",
    });
  }
};

exports.verifyPaymentWebhook = async (req, res) => {
  try {
    const webhookSignature = req.header("X-Razorpay-Signature");
    const webhookBody = req.rawBody || JSON.stringify(req.body);
    const isWebhookValid = validateWebhookSignature(
      webhookBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Webhook signature is invalid!" });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    console.log(`Received Razorpay webhook event: ${event}`);

    const paymentRecord = await Payment.findOne({
      razorpayOrderId: payload.order_id,
    });
    if (!paymentRecord) {
      console.error(
        `Payment record not found for Razorpay Order ID: ${payload.order_id}`,
      );
      return res.status(404).json({ message: "Payment record not found" });
    }

    const masterOrderRecord = await MasterOrder.findById(
      paymentRecord.masterOrder,
    );
    if (!masterOrderRecord) {
      console.error(
        `MasterOrder record not found for Payment ID: ${paymentRecord._id}`,
      );
      return res.status(404).json({ message: "Master order not found" });
    }

    if (
      event === "payment.captured" &&
      SUCCESS_PAYMENT_STATUSES.includes(paymentRecord.status)
    ) {
      return res.status(200).json({ received: true });
    }

    if (event === "payment.failed" && paymentRecord.status === "failed") {
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
    res.status(500).json({
      received: false,
      error: `Internal Server Error || ${error.message}`,
    });
  }
};

exports.handlePaymentCaptured = async ({ paymentRecord, payload }) => {
  const session = await mongoose.startSession();
  let shouldRemoveReleaseJob = false;
  let shouldQueueOrderConfirmationEmail = false;
  let lateCaptureContext = null;

  try {
    session.startTransaction();

    const masterOrder = await MasterOrder.findById(
      paymentRecord.masterOrder,
    ).session(session);
    if (!masterOrder) {
      throw createHttpError(404, "Master order not found");
    }

    if (masterOrder.paymentStatus === "paid") {
      await this.markSuccess(paymentRecord, payload, session);
      await session.commitTransaction();
      shouldRemoveReleaseJob = true;
    } else if (masterOrder.paymentStatus === "failed") {
      await this.markSuccess(paymentRecord, payload, session);
      await session.commitTransaction();

      lateCaptureContext = {
        masterOrderId: masterOrder._id,
        paymentId: paymentRecord._id,
        razorpayPaymentId: payload.id,
      };
    } else {
      await this.markSuccess(paymentRecord, payload, session);

      await InventoryService.confirmInventory(masterOrder._id, session);

      const confirmResult = await OrderService.confirmOrders(
        masterOrder._id,
        session,
      );
      if (!confirmResult) {
        throw new Error(
          "Failed to confirm orders: master order status changed",
        );
      }

      await session.commitTransaction();
      shouldRemoveReleaseJob = true;
      shouldQueueOrderConfirmationEmail = true;
    }
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  if (shouldRemoveReleaseJob) {
    try {
      await removeReleaseInventoryJob(paymentRecord.masterOrder.toString());
    } catch (jobError) {
      console.error("Failed to remove release inventory job after capture:", {
        masterOrderId: paymentRecord.masterOrder,
        message: jobError.message,
      });
    }
  }

  if (shouldQueueOrderConfirmationEmail) {
    try {
      await TransactionalMailService.queueBuyerOrderConfirmedEmail({
        masterOrderId: paymentRecord.masterOrder.toString(),
      });
    } catch (mailError) {
      console.error(
        "Failed to enqueue Razorpay order confirmation email after capture:",
        {
          masterOrderId: paymentRecord.masterOrder,
          paymentId: paymentRecord._id,
          message: mailError.message,
        },
      );
    }
  }

  if (lateCaptureContext) {
    console.error(
      "Captured payment received after reservation expiry",
      lateCaptureContext,
    );
  }
};

exports.handlePaymentFailed = async ({ paymentRecord, payload }) => {
  const session = await mongoose.startSession();
  let shouldQueuePaymentFailedEmail = false;
  let failureReason = payload?.error_description || "payment_failed";

  try {
    session.startTransaction();

    const masterOrder = await MasterOrder.findById(
      paymentRecord.masterOrder,
    ).session(session);
    if (!masterOrder) {
      throw createHttpError(404, "Master order not found");
    }

    if (masterOrder.paymentStatus === "paid") {
      await session.commitTransaction();
      return;
    }

    // A failed Razorpay payment attempt should not release stock immediately.
    // The order remains pending until the reservation expires or a later attempt succeeds.
    await this.markFailed(
      paymentRecord,
      {
        razorpayPaymentId: payload?.id,
        method: payload?.method,
        webhookPayload: payload,
        reason: failureReason,
      },
      session,
    );

    await session.commitTransaction();
    shouldQueuePaymentFailedEmail = true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  if (shouldQueuePaymentFailedEmail) {
    try {
      await TransactionalMailService.queueBuyerPaymentFailedEmail({
        masterOrderId: paymentRecord.masterOrder.toString(),
        paymentId: paymentRecord._id.toString(),
        failureReason,
      });
    } catch (mailError) {
      console.error("Failed to enqueue payment failed email after webhook:", {
        masterOrderId: paymentRecord.masterOrder,
        paymentId: paymentRecord._id,
        message: mailError.message,
      });
    }
  }
};

exports.markSuccess = async (paymentRecord, payload, session) => {
  if (SUCCESS_PAYMENT_STATUSES.includes(paymentRecord.status)) {
    return;
  }

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

  if (SUCCESS_PAYMENT_STATUSES.includes(paymentRecord.status)) {
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
    data.reason || data.failureReason || "unknown_failure";

  if (data.webhookPayload) {
    paymentRecord.webhookPayload = data.webhookPayload;
  }

  await paymentRecord.save(withSession(session));
};

exports.markAuthorized = async (payment, data) => {
  if (SUCCESS_PAYMENT_STATUSES.includes(payment.status)) {
    return;
  }

  if (payment.status === "failed") {
    return;
  }

  payment.status = "authorized";
  payment.razorpayPaymentId = data.razorpay_payment_id;
  payment.razorpaySignature = data.razorpay_signature;
  payment.method = data.method;

  await payment.save();
};

exports.extendReservation = async (
  masterOrder,
  delayMs = AUTHORIZED_PAYMENT_GRACE_MS,
) => {
  if (!masterOrder || masterOrder.paymentStatus !== "pending") {
    return;
  }

  const nextExpiry = getReservationExpiryDate(new Date(), delayMs);

  const updateResult = await MasterOrder.findOneAndUpdate(
    {
      _id: masterOrder._id,
      paymentStatus: "pending",
      $or: [
        { reservationExpiresAt: null },
        { reservationExpiresAt: { $lt: nextExpiry } },
      ],
    },
    {
      $set: { reservationExpiresAt: nextExpiry },
    },
    { new: true },
  );

  if (!updateResult) {
    // Update failed: order no longer pending or expiry already >= nextExpiry
    return;
  }

  try {
    await addReleaseInventoryJob(masterOrder._id.toString(), delayMs);
  } catch (jobError) {
    console.error("Failed to extend reservation release job:", {
      masterOrderId: masterOrder._id,
      message: jobError.message,
    });
  }
};
