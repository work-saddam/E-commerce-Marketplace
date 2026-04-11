const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const Payment = require("../models/payment");
const PaymentService = require("../services/payment.service");

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const paymentRecord = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (["captured", "paid"].includes(paymentRecord.status)) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    const isPaymentValid = validateWebhookSignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET,
    );

    if (!isPaymentValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ONLY AUTHORIZE (DO NOT CONFIRM ORDER HERE)
    await PaymentService.markAuthorized(paymentRecord, {
      razorpay_payment_id,
      razorpay_signature,
      method: "Razorpay",
    });

    return res.status(200).json({
      success: true,
      message:
        "Payment authorized. Awaiting confirmation from payment gateway.",
    });
  } catch (error) {
    console.error("Verify Payment Error:", {
      message: error.message,
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying payment",
    });
  }
};
