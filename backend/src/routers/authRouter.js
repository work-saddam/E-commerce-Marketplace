const express = require("express");
const {
  register,
  verifyRegistrationOtp,
  login,
  logout,
  requestOtp,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const {
  loginLimiter,
  registrationRequestLimiter,
  registrationVerifyLimiter,
} = require("../middlewares/authRateLimit");
const {
  validateForgotPasswordEmail,
  forgotPasswordRateLimit,
} = require("../middlewares/forgotPasswordRateLimit");
const router = express.Router();

router.post("/register", registrationRequestLimiter, register);
router.post("/register/verify-otp", registrationVerifyLimiter, verifyRegistrationOtp);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post(
  "/forgot-password/request-otp",
  validateForgotPasswordEmail,
  forgotPasswordRateLimit,
  requestOtp,
);
router.post("/forgot-password/verify-otp", verifyOtp);
router.post("/forgot-password/reset-password", resetPassword);

module.exports = router;
