const crypto = require("node:crypto");
const OTP = require("../models/otp");

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const createOtpRecord = async (
  email,
  userType,
  purpose = "password-reset",
  session,
) => {
  email = email.toLowerCase().trim();

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.findOneAndUpdate(
    { email, userType, purpose },
    { otp, attempts: 0, expiresAt, purpose },
    { upsert: true, new: true, session },
  );

  return otp;
};

const verifyOTP = async (
  email,
  userType,
  enteredOtp,
  purpose = "password-reset",
  session,
) => {
  email = email.toLowerCase().trim();
  const now = new Date();
  const query = {
    email,
    userType,
    purpose,
    expiresAt: { $gt: now },
    attempts: { $lt: 3 },
  };

  const verifiedOtp = await OTP.findOneAndDelete({
    ...query,
    otp: enteredOtp,
  }).session(session || null);

  if (verifiedOtp) {
    return { verified: true };
  }

  const attemptedOtp = await OTP.findOneAndUpdate(
    {
      ...query,
    },
    { $inc: { attempts: 1 } },
    { new: true, session },
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

  const otpRecord = await OTP.findOne({
    email,
    userType,
    purpose,
  })
    .select("_id expiresAt attempts")
    .session(session || null);

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

const deleteOtpRecord = async (
  email,
  userType,
  purpose = "password-reset",
  session,
) => {
  email = email.toLowerCase().trim();
  const query = OTP.deleteOne({
    email,
    userType,
    purpose,
  });
  if (session) {
    query.session(session);
  }
  await query;
};

const getOtpRecord = async (
  email,
  userType,
  purpose = "password-reset",
  session,
) => {
  email = email.toLowerCase().trim();
  const query = OTP.findOne({
    email,
    userType,
    purpose,
  });
  if (session) {
    query.session(session);
  }
  return query;
};

module.exports = {
  generateOTP,
  createOtpRecord,
  verifyOTP,
  deleteOtpRecord,
  getOtpRecord,
};
