const validator = require("validator");

const ALLOWED_NODE_ENVS = ["development", "test", "production"];
const REQUIRED_ENVS = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "REDIS_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
  "MAIL_FROM",
  "CLIENT_APP_URL",
  "SELLER_APP_URL",
];

const readEnv = (name) => {
  const value = process.env[name]?.trim();

  if (value) {
    process.env[name] = value;
  }

  return value;
};

const requireEnv = (name, errors) => {
  const value = readEnv(name);

  if (!value) {
    errors.push(`${name} is required`);
    return undefined;
  }

  return value;
};

const validateUrl = (name, value, protocols, errors) => {
  try {
    const url = new URL(value);

    if (!protocols.includes(url.protocol)) {
      errors.push(
        `${name} must use one of these protocols: ${protocols.join(", ")}`,
      );
    }
  } catch (_error) {
    errors.push(`${name} must be a valid absolute URL`);
  }
};

const validateMongoUri = (name, value, errors) => {
  if (!/^mongodb(\+srv)?:\/\//i.test(value)) {
    errors.push(`${name} must start with mongodb:// or mongodb+srv://`);
    return;
  }

  if (/[\s"'`]/.test(value)) {
    errors.push(`${name} must not contain spaces or quote characters`);
    return;
  }

  try {
    const url = new URL(value);

    if (!url.hostname) {
      errors.push(`${name} must include a database host`);
    }
  } catch (_error) {
    errors.push(`${name} must be a valid MongoDB connection string`);
  }
};

const validatePositiveInteger = (name, value, errors) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    errors.push(`${name} must be a positive integer`);
  }
};

const validatePort = (name, value, errors) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1 || number > 65535) {
    errors.push(`${name} must be an integer between 1 and 65535`);
  }
};

const validateEnvironment = () => {
  const errors = [];
  const nodeEnv = readEnv("NODE_ENV") || "development";
  process.env.NODE_ENV = nodeEnv;

  if (!ALLOWED_NODE_ENVS.includes(nodeEnv)) {
    errors.push(
      `NODE_ENV must be one of: ${ALLOWED_NODE_ENVS.join(", ")}`,
    );
  }

  const env = Object.fromEntries(
    REQUIRED_ENVS.map((name) => [name, requireEnv(name, errors)]),
  );
  const mailReplyTo = readEnv("MAIL_REPLY_TO");
  const orderReservationDelayMin = readEnv("ORDER_RESERVATION_DELAY_MIN");
  const authorizedPaymentGraceMin = readEnv("AUTHORIZED_PAYMENT_GRACE_MIN");

  if (env.PORT) {
    validatePort("PORT", env.PORT, errors);
  }

  if (env.MONGO_URI) {
    validateMongoUri("MONGO_URI", env.MONGO_URI, errors);
  }

  if (env.JWT_SECRET && env.JWT_SECRET.length < 16) {
    errors.push("JWT_SECRET must be at least 16 characters long");
  }

  if (env.REDIS_URL) {
    validateUrl("REDIS_URL", env.REDIS_URL, ["redis:", "rediss:"], errors);
  }

  if (env.CLIENT_APP_URL) {
    validateUrl(
      "CLIENT_APP_URL",
      env.CLIENT_APP_URL,
      ["http:", "https:"],
      errors,
    );
  }

  if (env.SELLER_APP_URL) {
    validateUrl(
      "SELLER_APP_URL",
      env.SELLER_APP_URL,
      ["http:", "https:"],
      errors,
    );
  }

  if (nodeEnv === "production") {
    if (env.CLIENT_APP_URL && !env.CLIENT_APP_URL.startsWith("https://")) {
      errors.push("CLIENT_APP_URL must use HTTPS in production");
    }

    if (env.SELLER_APP_URL && !env.SELLER_APP_URL.startsWith("https://")) {
      errors.push("SELLER_APP_URL must use HTTPS in production");
    }
  }

  if (env.MAIL_FROM && !validator.isEmail(env.MAIL_FROM)) {
    errors.push("MAIL_FROM must be a valid email address");
  }

  if (mailReplyTo && !validator.isEmail(mailReplyTo)) {
    errors.push("MAIL_REPLY_TO must be a valid email address");
  }

  if (
    env.CLOUDINARY_CLOUD_NAME &&
    !/^[A-Za-z0-9_-]+$/.test(env.CLOUDINARY_CLOUD_NAME)
  ) {
    errors.push("CLOUDINARY_CLOUD_NAME contains invalid characters");
  }

  if (env.CLOUDINARY_API_KEY && !/^\d+$/.test(env.CLOUDINARY_API_KEY)) {
    errors.push("CLOUDINARY_API_KEY must contain only digits");
  }

  if (orderReservationDelayMin) {
    validatePositiveInteger(
      "ORDER_RESERVATION_DELAY_MIN",
      orderReservationDelayMin,
      errors,
    );
  }

  if (authorizedPaymentGraceMin) {
    validatePositiveInteger(
      "AUTHORIZED_PAYMENT_GRACE_MIN",
      authorizedPaymentGraceMin,
      errors,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`,
    );
  }
};

module.exports = { validateEnvironment };
