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

    const { name, email, password, phone, role, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registerd!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashPassword,
      phone,
      role,
      address,
    });
    const savedUser = await user.save();

    res
      .status(201)
      .json({ message: "Registration Successfull!", data: savedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration Failed!", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email & Password are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const token = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

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
