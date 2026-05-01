const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middlewares/authRateLimit");
const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);

module.exports = router;
