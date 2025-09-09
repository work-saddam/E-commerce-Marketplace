const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    sellerName: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gstNumber: { type: String, required: true, trim: true },
    panNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["seller", "admin"],
      default: "seller",
    },
  },
  { timestamps: true }
);

const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;
