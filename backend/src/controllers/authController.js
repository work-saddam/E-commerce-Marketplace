const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  validateUserRegisterData,
  validateLoginData,
} = require("../utils/validation");
const {
  getAuthCookieOptions,
  getAuthClearCookieOptions,
} = require("../config/security");

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
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const fieldMessage =
        duplicateField === "phone" ? "Phone number already registered!" : "Email already registered!";
      return res.status(409).json({ message: fieldMessage });
    }

    res
      .status(500)
      .json({ message: "Registration Failed!", error: error.message });
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
    res.status(500).json({ message: "Login Failed!", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", getAuthClearCookieOptions());
    res.status(200).json({ message: "Logout Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Logout Failed!", error: error.message });
  }
};

module.exports = { register, login, logout };
