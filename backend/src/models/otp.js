const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "password-reset"],
      required: true,
      default: "password-reset",
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL index - automatically delete OTP records 10 minutes after creation
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookups
otpSchema.index({ email: 1, userType: 1, purpose: 1 }, { unique: true });

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
