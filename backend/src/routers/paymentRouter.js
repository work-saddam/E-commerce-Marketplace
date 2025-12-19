const express = require("express");
const router = express.Router();
const { createPayment } = require("../controllers/paymentController");
const { userAuth } = require("../middlewares/authMiddleware");

router.post("/create", userAuth, createPayment);

module.exports = router;
