const MasterOrder = require("../models/masterOrder");
const Payment = require("../models/payment"); // Renamed 'payment' to 'Payment' for consistency with model naming conventions
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

    const existingPayment = await Payment.findOne({ // Use Payment instead of payment
      masterOrder: masterOrder._id,
    })
      .sort({ createdAt: -1 });

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

    await Payment.create({
      // Use Payment instead of payment
      masterOrder: masterOrder._id,
      buyer: masterOrder.buyer,
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
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({
      message: "Something went wrong while creating payment",
    });
  }
};

// 1. check PR
// 2. Add idempotency check to prevent duplicate payment creation.
// 3. payment status ["created","authorized","captured","refunded","failed"],

// 4. add verify payment webhook handler
// 5. Final : Refactor to Inventory Reservation concept
