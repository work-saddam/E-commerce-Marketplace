const User = require("../models/user");
const { validateUserEditProfileData, validateContactUpdateData } = require("../utils/validation");
const otpService = require("../services/otp.service");
const { queueContactUpdateOtpEmail } = require("../services/transactionalMail.service");

const CONTACT_UPDATE_PURPOSE = "contact-update";

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "Profile Fetched Successfully", data: user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Profile Fetch Failed!!", error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const error = validateUserEditProfileData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res
      .status(200)
      .json({ message: "User updated Successfully!!", data: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Edit User Failed!", error: error.message });
  }
};

/**
 * Step 1 — Send OTP to the logged-in user's current email.
 * Body: { field: "email" | "phone", value: string }
 */
const sendContactUpdateOtp = async (req, res) => {
  try {
    // Validate the new value format before sending OTP
    const validationError = validateContactUpdateData(req);
    if (validationError) {
      return res.status(validationError.status).json({ message: validationError.message });
    }

    const { field, value } = req.body;

    const user = await User.findById(req.user.id).select("name email phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Guard: new value must differ from current
    if (user[field] === value) {
      return res.status(400).json({ message: `This is already your current ${field}` });
    }

    // Guard: new value must not be taken by another account
    const conflict = await User.findOne({ [field]: value, _id: { $ne: req.user.id } });
    if (conflict) {
      return res.status(409).json({ message: `This ${field} is already linked to another account` });
    }

    // Create / upsert OTP record (10-minute TTL)
    const otp = await otpService.createOtpRecord(
      user.email,
      "buyer",
      CONTACT_UPDATE_PURPOSE,
    );

    // Send OTP to the user's CURRENT email
    await queueContactUpdateOtpEmail({
      email: user.email,
      otp,
      userName: user.name,
      field,
    });

    return res.status(200).json({
      message: `OTP sent to your registered email. It expires in 10 minutes.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

/**
 * Step 2 — Verify OTP and apply the contact update.
 * Body: { field: "email" | "phone", value: string, otp: string }
 */
const verifyContactUpdateOtp = async (req, res) => {
  try {
    const { field, value, otp } = req.body;

    if (!field || !value || !otp) {
      return res.status(400).json({ message: "field, value, and otp are required" });
    }

    if (!["email", "phone"].includes(field)) {
      return res.status(400).json({ message: "Invalid field" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    const user = await User.findById(req.user.id).select("name email phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP against the user's current email
    await otpService.verifyOTP(user.email, "buyer", otp, CONTACT_UPDATE_PURPOSE);

    // Re-check uniqueness at apply time (race condition safety)
    const conflict = await User.findOne({ [field]: value, _id: { $ne: req.user.id } });
    if (conflict) {
      return res.status(409).json({ message: `This ${field} is already linked to another account` });
    }

    // Apply the update
    user[field] = value;
    await user.save();

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(200).json({
      message: `${fieldLabel} updated successfully`,
      data: userData,
    });
  } catch (error) {
    // Surface OTP-specific errors (wrong code, expired, max attempts) as 400
    const otpErrors = ["Invalid OTP", "expired", "Maximum attempts", "not found"];
    const isOtpError = otpErrors.some((e) => error.message?.includes(e));
    const status = isOtpError ? 400 : 500;
    return res.status(status).json({ message: error.message || "Contact update failed" });
  }
};

module.exports = { getProfile, editProfile, sendContactUpdateOtp, verifyContactUpdateOtp };
