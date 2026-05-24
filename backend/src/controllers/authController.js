const User = require("../models/user");
const Seller = require("../models/seller");
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
        message: "If an account exists with this email, an OTP will be sent.",
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
      message: "OTP sent to your email. Valid for 10 minutes.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
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
