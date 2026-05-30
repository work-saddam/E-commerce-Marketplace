const crypto = require("node:crypto");
const OTP = require("../models/otp");

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const createOtpRecord = async (email, userType) => {
  email = email.toLowerCase().trim();

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.findOneAndUpdate(
    { email, userType },
    { otp, attempts: 0, expiresAt },
    { upsert: true, new: true },
  );

  return otp;
};

const verifyOTP = async (email, userType, enteredOtp) => {
  email = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({ email, userType });

  if (!otpRecord) {
    throw new Error("OTP not found. Please request a new OTP.");
  }

  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ email, userType });
    throw new Error("OTP expired. Please request a new OTP.");
  }

  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ email, userType });
    throw new Error("Maximum attempts exceeded. Please request a new OTP.");
  }

  if (otpRecord.otp !== enteredOtp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remainingAttempts = 3 - otpRecord.attempts;
    throw new Error(
      `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
    );
  }

  return { verified: true };
};

const deleteOtpRecord = async (email, userType) => {
  email = email.toLowerCase().trim();
  await OTP.deleteOne({ email, userType });
};

const getOtpRecord = async (email, userType) => {
  email = email.toLowerCase().trim();
  return OTP.findOne({ email, userType });
};

module.exports = {
  generateOTP,
  createOtpRecord,
  verifyOTP,
  deleteOtpRecord,
  getOtpRecord,
};
