const Order = require("../models/order");
const Seller = require("../models/seller");
const { validateSellerRegisterData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.sellerRegister = async (req, res) => {
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

exports.sellerLogin = async (req, res) => {
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

    const sellerData = {
      _id: seller._id,
      sellerName: seller.sellerName,
      shopName: seller.shopName,
      email: seller.email,
      phone: seller.phone,
      status: seller.status,
      role: seller.role,
    };

    res.status(200).json({
      message: "Login Successfully!",
      data: sellerData,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login Failed!", error: error.message });
  }
};

exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res
      .status(200)
      .json({ message: "Seller Profile Fetched Successfully", data: seller });
  } catch (error) {
    res.status(500).json({ message: "Failed to get Seller Profile" });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    let { page = 1, limit } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 100) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ seller: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("buyer", "name email")
        .populate({
          path: "products.product",
          model: "Product",
          select: "title image.url",
        }),
      Order.countDocuments({ seller: req.user.id }),
    ]);

    res.status(200).json({
      message: "Orders fetch successfully",
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};
