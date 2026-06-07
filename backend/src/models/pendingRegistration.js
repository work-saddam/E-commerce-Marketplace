const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    userType: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    registrationData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
pendingRegistrationSchema.index(
  { email: 1, userType: 1 },
  { unique: true },
);
pendingRegistrationSchema.index({ phone: 1, userType: 1 }, { unique: true });

const PendingRegistration = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema,
);

module.exports = PendingRegistration;
