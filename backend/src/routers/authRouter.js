const express = require("express");
const {
  register,
  login,
  logout,
  requestOtp,
} = require("../controllers/authController");
const {
  loginLimiter,
  registerLimiter,
} = require("../middlewares/authRateLimit");
const {
  forgotPasswordRateLimit,
} = require("../middlewares/forgotPasswordRateLimit");
const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post(
  "/forgot-password/request-otp",
  forgotPasswordRateLimit,
  requestOtp,
);

module.exports = router;
