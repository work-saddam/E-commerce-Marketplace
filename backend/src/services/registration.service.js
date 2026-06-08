const PendingRegistration = require("../models/pendingRegistration");
const User = require("../models/user");
const Seller = require("../models/seller");

const REGISTRATION_TTL_MS = 10 * 60 * 1000;

const normalizeEmail = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

const normalizePhone = (value) => String(value || "").trim();

const getAccountModel = (userType) => (userType === "seller" ? Seller : User);

const getRegistrationDefaults = (userType) => {
  const base = {
    isVerified: true,
    emailVerifiedAt: new Date(),
  };

  if (userType === "seller") {
    return {
      ...base,
      role: "seller",
      status: "pending",
    };
  }

  return base;
};

const buildPendingRegistrationData = (userType, registrationData) => {
  if (userType === "seller") {
    const { sellerName, shopName, email, phone, gstNumber, panNumber } =
      registrationData;

    return {
      sellerName,
      shopName,
      email,
      phone,
      gstNumber,
      panNumber,
    };
  }

  const { name, email, phone } = registrationData;

  return {
    name,
    email,
    phone,
  };
};

const createPendingRegistration = async ({
  userType,
  registrationData,
  passwordHash,
  session,
}) => {
  const email = normalizeEmail(registrationData.email);
  const phone = normalizePhone(registrationData.phone);
  const expiresAt = new Date(Date.now() + REGISTRATION_TTL_MS);

  const draft = {
    email,
    phone,
    userType,
    passwordHash,
    registrationData: buildPendingRegistrationData(userType, {
      ...registrationData,
      email,
      phone,
    }),
    expiresAt,
  };

  return PendingRegistration.findOneAndUpdate(
    { email, userType },
    {
      $set: draft,
    },
    {
      upsert: true,
      new: true,
      session,
      setDefaultsOnInsert: true,
    },
  );
};

const getPendingRegistration = async (email, userType, session) => {
  const query = PendingRegistration.findOne({
    email: normalizeEmail(email),
    userType,
  });

  if (session) {
    query.session(session);
  }

  return query;
};

const deletePendingRegistration = async (email, userType, session) => {
  const query = PendingRegistration.deleteOne({
    email: normalizeEmail(email),
    userType,
  });

  if (session) {
    query.session(session);
  }

  return query;
};

const finalizeRegistration = async ({ email, userType, session }) => {
  const pendingRegistration = await getPendingRegistration(
    email,
    userType,
    session,
  );

  if (!pendingRegistration) {
    throw new Error("Registration session expired. Please start again.");
  }

  const expiresAt =
    pendingRegistration.expiresAt || pendingRegistration.expires;
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    await deletePendingRegistration(email, userType, session);
    throw new Error("Registration session expired. Please start again.");
  }

  const AccountModel = getAccountModel(userType);
  const defaults = getRegistrationDefaults(userType);
  const registrationData = pendingRegistration.registrationData || {};

  const [account] = await AccountModel.create(
    [
      {
        ...registrationData,
        password: pendingRegistration.passwordHash,
        ...defaults,
      },
    ],
    { session },
  );

  await deletePendingRegistration(email, userType, session);

  return account;
};

const cleanupPendingRegistration = async (email, userType) => {
  const normalizedEmail = normalizeEmail(email);
  await PendingRegistration.deleteOne({ email: normalizedEmail, userType });
};

module.exports = {
  REGISTRATION_TTL_MS,
  createPendingRegistration,
  finalizeRegistration,
  cleanupPendingRegistration,
  deletePendingRegistration,
  getPendingRegistration,
};
