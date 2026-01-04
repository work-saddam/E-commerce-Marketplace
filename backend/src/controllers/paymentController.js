const payment = require("../models/payment");
const razorpayInstance = require("../utils/razorpay");

exports.createPayment = async (req, res) => {
  const { masterOrder } = req.body;

  try {
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: masterOrder.totalAmount * 100,
      currency: "INR",
      receipt: `receipt#${masterOrder._id}`,
      partial_payment: false,
      notes: {
        masterOrderId: masterOrder._id.toString(),
        buyerId: masterOrder.buyer.toString(),
        orderCount: masterOrder.orders.length,
      },
    });

    const paymentDetails = await payment.create({
      masterOrder: masterOrder._id,
      buyer: masterOrder.buyer.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: "created",
      notes: razorpayOrder.notes,
    });

    res.status(201).json({
      message: "Payment created successfully",
      ...paymentDetails.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
};
