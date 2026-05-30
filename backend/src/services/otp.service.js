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
  const now = new Date();

  const verifiedOtp = await OTP.findOneAndDelete({
    email,
    userType,
    otp: enteredOtp,
    expiresAt: { $gt: now },
    attempts: { $lt: 3 },
  });

  if (verifiedOtp) {
    return { verified: true };
  }

  const attemptedOtp = await OTP.findOneAndUpdate(
    {
      email,
      userType,
      expiresAt: { $gt: now },
      attempts: { $lt: 3 },
    },
    { $inc: { attempts: 1 } },
    { new: true },
  );

  if (attemptedOtp) {
    const remainingAttempts = Math.max(0, 3 - attemptedOtp.attempts);

    if (remainingAttempts === 0) {
      await OTP.deleteOne({ _id: attemptedOtp._id });
      throw new Error("Maximum attempts exceeded. Please request a new OTP.");
    }

    throw new Error(
      `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
    );
  }

  const otpRecord = await OTP.findOne({ email, userType }).select(
    "_id expiresAt attempts",
  );

  if (!otpRecord) {
    throw new Error("OTP not found. Please request a new OTP.");
  }

  if (otpRecord.expiresAt <= now) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("OTP expired. Please request a new OTP.");
  }

  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("Maximum attempts exceeded. Please request a new OTP.");
  }

  throw new Error("Invalid OTP. Please try again.");
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
