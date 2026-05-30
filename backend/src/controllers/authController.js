const User = require("../models/user");
const Seller = require("../models/seller");
const PasswordResetToken = require("../models/passwordResetToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const {
  validateUserRegisterData,
  validateLoginData,
} = require("../utils/validation");
const {
  getAuthCookieOptions,
  getAuthClearCookieOptions,
} = require("../config/security");
const otpService = require("../services/otp.service");
const {
  queueForgotPasswordOtpEmail,
} = require("../services/transactionalMail.service");

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const RESET_TOKEN_JWT_EXPIRY = "15m";

const getResetTokenUserType = (userType) =>
  userType === "seller" ? "Seller" : "User";

const register = async (req, res) => {
  try {
    const error = validateUserRegisterData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const field = existingUser.email == email ? "Email" : "Phone number";
      return res.status(400).json({ message: `${field} already registered!` });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashPassword,
      phone,
    });
    const savedUser = await user.save();

    res
      .status(201)
      .json({ message: "Registration Successful!", data: savedUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Registration failed. Try logging in or resetting your password.",
      });
    }

    res
      .status(500)
      .json({ message: "Registration Failed! Please try again later." });
  }
};

const login = async (req, res) => {
  try {
    const error = validateLoginData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token, getAuthCookieOptions());

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res
      .status(200)
      .json({ message: "Login Successfully!", data: userData, token: token });
  } catch (error) {
    res.status(500).json({ message: "Login Failed! Please try again later." });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", getAuthClearCookieOptions());
    res.status(200).json({ message: "Logout Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Logout Failed! Please try again later." });
  }
};

const requestOtp = async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const validUserType =
      userType && ["buyer", "seller"].includes(userType) ? userType : "buyer";

    let user;
    if (validUserType === "seller") {
      user = await Seller.findOne({ email: normalizedEmail }).select(
        "_id sellerName",
      );
    } else {
      user = await User.findOne({ email: normalizedEmail }).select("_id name");
    }

    if (!user) {
      return res.status(200).json({
        message: "If an account exists, an OTP has been sent to the email",
      });
    }

    const otp = await otpService.createOtpRecord(
      normalizedEmail,
      validUserType,
    );
    const userName =
      validUserType === "seller"
        ? user.sellerName || "User"
        : user.name || "User";

    await queueForgotPasswordOtpEmail({
      email: normalizedEmail,
      otp,
      userName,
    });

    res.status(200).json({
      message: "OTP sent to your email if an account exists",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, userType } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const validUserType =
      userType && ["buyer", "seller"].includes(userType) ? userType : "buyer";
    const resetTokenUserType = getResetTokenUserType(validUserType);

    await otpService.verifyOTP(normalizedEmail, validUserType, otp);

    let user;
    if (validUserType === "seller") {
      user = await Seller.findOne({ email: normalizedEmail }).select("_id");
    } else {
      user = await User.findOne({ email: normalizedEmail }).select("_id");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await PasswordResetToken.deleteMany({
      userId: user._id,
      userType: resetTokenUserType,
    });

    const resetToken = jwt.sign(
      { email: normalizedEmail, userType: validUserType },
      process.env.JWT_SECRET,
      { expiresIn: RESET_TOKEN_JWT_EXPIRY },
    );

    await PasswordResetToken.create({
      userId: user._id,
      userType: resetTokenUserType,
      token: resetToken,
      expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
    });

    await otpService.deleteOtpRecord(normalizedEmail, validUserType);

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    const message =
      error.message || "OTP verification failed. Please try again later.";
    const status =
      error.message?.includes("not found") ||
      error.message?.includes("expired") ||
      error.message?.includes("attempt") ||
      error.message?.includes("attempts")
        ? 400
        : 500;
    res.status(status).json({ message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Reset token and new password are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired reset token" });
    }

    const { userType } = decoded;
    const validUserType = userType || "buyer";
    const resetTokenUserType = getResetTokenUserType(validUserType);

    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
      });
    }

    const storedResetToken = await PasswordResetToken.findOneAndUpdate(
      {
        token: resetToken,
        userType: resetTokenUserType,
        used: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { used: true } },
      { new: false },
    ).select("_id userId");

    if (!storedResetToken) {
      return res.status(401).json({
        message: "Invalid, expired, or already used reset token",
      });
    }

    let user;
    if (validUserType === "seller") {
      user = await Seller.findById(storedResetToken.userId);
    } else {
      user = await User.findById(storedResetToken.userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed. Please try again later.",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  requestOtp,
  verifyOtp,
  resetPassword,
};
