const express = require("express");
const router = express.Router();
const {
  createPayment,
  verifyPaymentWebhook,
  verifyPayment,
} = require("../controllers/paymentController");
const { userAuth } = require("../middlewares/authMiddleware");

router.post("/create", userAuth, createPayment);
router.post("/webhook", verifyPaymentWebhook);
router.post("/verify", userAuth, verifyPayment);

module.exports = router;
