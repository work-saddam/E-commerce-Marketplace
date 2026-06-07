const Order = require("../models/order");
const Seller = require("../models/seller");
const validator = require("validator");
const {
  validateSellerRegisterData,
  validateSellerLoginData,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const TransactionalMailService = require("../services/transactionalMail.service");
const { getAuthCookieOptions } = require("../config/security");
const otpService = require("../services/otp.service");
const {
  createPendingRegistration,
  finalizeRegistration,
  cleanupPendingRegistration,
} = require("../services/registration.service");

const REGISTRATION_OTP_PURPOSE = "registration";
const REGISTRATION_RESPONSE_MESSAGE =
  "If the details are valid, an OTP has been sent to your email.";
const REGISTRATION_SUCCESS_MESSAGE =
  "Registration verified successfully. You can now log in.";
const normalizeEmail = (value) =>
  typeof value === "string" ? value.toLowerCase().trim() : undefined;

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
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const existingSeller = await Seller.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });
    if (existingSeller) {
      await cleanupPendingRegistration(normalizedEmail, "seller");
      await otpService.deleteOtpRecord(
        normalizedEmail,
        "seller",
        REGISTRATION_OTP_PURPOSE,
      );
      return res.status(200).json({
        message: REGISTRATION_RESPONSE_MESSAGE,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await createPendingRegistration({
      userType: "seller",
      registrationData: {
        sellerName,
        shopName,
        email: normalizedEmail,
        phone: normalizedPhone,
        gstNumber,
        panNumber,
      },
      passwordHash: hashPassword,
    });

    const otp = await otpService.createOtpRecord(
      normalizedEmail,
      "seller",
      REGISTRATION_OTP_PURPOSE,
    );

    await TransactionalMailService.queueRegistrationOtpEmail({
      email: normalizedEmail,
      otp,
      userName: sellerName,
      accountType: "seller",
    });

    res.status(200).json({
      message: REGISTRATION_RESPONSE_MESSAGE,
    });
  } catch (error) {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (normalizedEmail) {
      await cleanupPendingRegistration(normalizedEmail, "seller");
      await otpService.deleteOtpRecord(
        normalizedEmail,
        "seller",
        REGISTRATION_OTP_PURPOSE,
      );
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Registration failed. Try logging in or resetting your password.",
      });
    }

    res.status(500).json({ message: "Registration failed. Please try again later." });
  }
};

exports.verifySellerRegistrationOtp = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);
  let session;

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    await otpService.verifyOTP(
      normalizedEmail,
      "seller",
      otp,
      REGISTRATION_OTP_PURPOSE,
      session,
    );

    const account = await finalizeRegistration({
      email: normalizedEmail,
      userType: "seller",
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
      message: REGISTRATION_SUCCESS_MESSAGE,
      data: {
        _id: account._id,
        email: account.email,
      },
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    if (normalizedEmail) {
      await cleanupPendingRegistration(normalizedEmail, "seller");
      await otpService.deleteOtpRecord(
        normalizedEmail,
        "seller",
        REGISTRATION_OTP_PURPOSE,
      );
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Registration failed. Try logging in or resetting your password.",
      });
    }

    const message =
      error.message || "Registration verification failed. Please try again later.";
    const status =
      message.includes("expired") ||
      message.includes("attempt") ||
      message.includes("OTP") ||
      message.includes("Registration session expired")
        ? 400
        : 500;

    return res.status(status).json({ message });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

exports.sellerLogin = async (req, res) => {
  try {
    const error = validateSellerLoginData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { identifier, password } = req.body;

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
      { expiresIn: "3d" },
    );

    res.cookie("token", token, getAuthCookieOptions());

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
        searchQuery["buyer.0.name"] = regex;
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

    const allowedStatus = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    const order = await Order.findOne({ _id: id, seller: req.user.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === status) {
      return res.status(200).json({
        message: `Order status is already ${status}`,
        data: order,
      });
    }

    order.orderStatus = status;
    await order.save();

    try {
      await TransactionalMailService.queueBuyerOrderStatusUpdatedEmail({
        orderId: order._id.toString(),
        status,
      });
    } catch (mailError) {
      console.error("Failed to enqueue buyer order status email", {
        orderId: order._id,
        status,
        message: mailError.message,
      });
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
