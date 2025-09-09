const Seller = require("../models/seller");
const { validateSellerRegisterData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sellerRegister = async (req, res) => {
  try {
    const error = validateSellerRegisterData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const {
      sellerName,
      shopName,
      email,
      password,
      phone,
      gstNumber,
      panNumber,
    } = req.body;

    const existingSeller = await Seller.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingSeller) {
      const field = existingSeller.email == email ? "Email" : "Phone Number";
      return res
        .status(400)
        .json({ message: `${field} is already Registered!` });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const seller = new Seller({
      sellerName,
      shopName,
      email,
      password: hashPassword,
      phone,
      gstNumber,
      panNumber,
    });
    const savedSeller = await seller.save();

    res
      .status(201)
      .json({ message: "Register Successfully!", data: savedSeller });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration Failed!", error: error.message });
  }
};

const sellerLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const seller = await Seller.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!seller) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = await jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.status(200).json({
      message: "Login Successfully!",
      data: seller,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login Failed!", error: error.message });
  }
};

module.exports = { sellerRegister, sellerLogin };
