const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateUserRegisterData } = require("../utils/validation");

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
    res
      .status(500)
      .json({ message: "Registration Failed!", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/Phone & Password are required!" });
    }

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res
      .status(200)
      .json({ message: "Login Successfully!", data: user, token: token });
  } catch (error) {
    res.status(500).json({ message: "Login Failed!", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logout Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Logout Failed!", error: error.message });
  }
};

module.exports = { register, login, logout };
