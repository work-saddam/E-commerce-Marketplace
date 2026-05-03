const Address = require("../models/address");
const MasterOrder = require("../models/masterOrder");
const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate({
        path: "seller",
        select: "shopName sellerName email",
      })
      .populate({
        path: "products.product",
        select: "title image",
      })
      .select("seller products orderStatus subTotal createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    res
      .status(200)
      .json({ message: "Order fetched successfully!", data: orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Order fetch failed!", error: error.message });
  }
};

exports.getOrderbyId = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "buyer products.product",
      select: "name email phone title image.url",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = String(req.user.id);
    const isBuyer = userId === String(order.buyer._id);
    const isSeller = userId === String(order.seller);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    return res
      .status(200)
      .json({ message: "Order fetched successfully", data: order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch the order", error: error.message });
  }
};
