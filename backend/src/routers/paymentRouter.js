const express = require("express");
const router = express.Router();
const {
  createPayment,
  verifyPaymentWebhook,
} = require("../controllers/paymentController");
const { userAuth } = require("../middlewares/authMiddleware");

router.post("/create", userAuth, createPayment);
router.post("/webhook", verifyPaymentWebhook);

module.exports = router;
s;
