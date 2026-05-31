const validator = require("validator");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const createRedisConnection = require("../config/redis");

const FORGOT_PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_PASSWORD_MAX_REQUESTS = 5;
const FORGOT_PASSWORD_RATE_LIMIT_MESSAGE =
  "Too many OTP requests. Please try again later.";

const redisClient = createRedisConnection();

const createRateLimitStore = (prefix) =>
  new RedisStore({
    sendCommand: (command, ...args) => redisClient.call(command, ...args),
    prefix,
  });

const normalizeEmail = (email) =>
  typeof email === "string" ? email.toLowerCase().trim() : "";

const getRetryAfterSeconds = (resetTime) => {
  if (!resetTime) {
    return Math.ceil(FORGOT_PASSWORD_WINDOW_MS / 1000);
  }
  return Math.max(
    1,
    Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000)
  );
};

const validateForgotPasswordEmail = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }

  const email = normalizeEmail(req.body.email);
  req.body.email = email;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  return next();
};

const forgotPasswordRateLimit = rateLimit({
  windowMs: FORGOT_PASSWORD_WINDOW_MS,
  max: FORGOT_PASSWORD_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore("rl:forgot-password:ip:"),
  passOnStoreError: true,
  keyGenerator: (req) => `ip:${ipKeyGenerator(req.ip)}`,
  handler: (req, res, _next, limitOptions) => {
    const retryAfter = getRetryAfterSeconds(req.rateLimit?.resetTime);

    res.set("Retry-After", retryAfter.toString());

    return res.status(limitOptions.statusCode).json({
      message: FORGOT_PASSWORD_RATE_LIMIT_MESSAGE,
      retryAfter,
    });
  }
});

module.exports = {
  validateForgotPasswordEmail,
  forgotPasswordRateLimit,
  FORGOT_PASSWORD_WINDOW_MS,
  FORGOT_PASSWORD_MAX_REQUESTS,
};
