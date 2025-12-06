const Order = require("../models/order");
const Seller = require("../models/seller");
const { validateSellerRegisterData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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
    let { page = 1, limit, status = "", search = "" } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 100) || 10;
    const skip = (page - 1) * limit;

    const regex = new RegExp(search.trim(), "i");

    const searchQuery = {};
    if (status !== "") searchQuery.orderStatus = status;

    if (search.trim() !== "") {
      const isId = mongoose.Types.ObjectId.isValid(search.trim());
      if (isId) {
        searchQuery._id = new mongoose.Types.ObjectId(search.trim());
      } else {
        searchQuery["buyer.name"] = regex;
      }
    }

    const result = await Order.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productsDetail",
          pipeline: [{ $project: { title: 1, "image.url": 1 } }],
        },
      },
      // MERGE LOGIC
      {
        $set: {
          products: {
            $map: {
              input: "$products",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productsDetail",
                          as: "detail",
                          cond: { $eq: ["$$detail._id", "$$item.product"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },

      // remove extra field
      { $project: { productsDetail: 0 } },

      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      { $match: searchQuery },
      {
        $facet: {
          orders: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const orders = result[0]?.orders || [];
    const total = result[0]?.totalCount[0]?.count || 0;

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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    const allowedStatus = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, seller: req.user.id },
      { orderStatus: status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Successfully update the order status!",
      data: order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Order status updation failed!", error: error });
  }
};
