const instance = require("../utils/razorpay");

exports.createPayment = async (req, res) => {
  try {
    instance.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: "receipt#1",
      partial_payment: false,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    });
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
    });
  }
};
