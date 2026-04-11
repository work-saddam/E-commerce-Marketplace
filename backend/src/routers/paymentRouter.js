const express = require("express");
const router = express.Router();
const { verifyPayment } = require("../controllers/paymentController");
const { userAuth } = require("../middlewares/authMiddleware");
const PaymentService = require("../services/payment.service");

router.post("/create", userAuth, PaymentService.createPayment);
router.post("/webhook", PaymentService.verifyPaymentWebhook);
router.post("/verify", userAuth, verifyPayment);

module.exports = router;
