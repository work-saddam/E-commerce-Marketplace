const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const createRedisConnection = require("../config/redis");

const AUTH_WINDOW_MS = 60 * 1000;
const AUTH_MAX_REQUESTS = 5;
const AUTH_RATE_LIMIT_MESSAGE =
  "Too many authentication attempts. Try again later.";
const FALLBACK_RETRY_AFTER_SECONDS = Math.ceil(AUTH_WINDOW_MS / 1000);

const redisClient = createRedisConnection();

const createRateLimitStore = (prefix) =>
  new RedisStore({
    sendCommand: (command, ...args) => redisClient.call(command, ...args),
    prefix,
  });

const getRetryAfterSeconds = (resetTime) => {
  if (!resetTime) {
    return FALLBACK_RETRY_AFTER_SECONDS;
  }

  return Math.max(
    1,
    Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000),
  );
};

const createAuthLimiter = (prefix, options = {}) =>
  rateLimit({
    windowMs: AUTH_WINDOW_MS,
    max: AUTH_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore(prefix),
    passOnStoreError: true,
    ...options,
    handler: (req, res, _next, limitOptions) => {
      const retryAfter = getRetryAfterSeconds(req.rateLimit?.resetTime);

      res.set("Retry-After", retryAfter.toString());

      return res.status(limitOptions.statusCode).json({
        message: AUTH_RATE_LIMIT_MESSAGE,
        retryAfter,
      });
    },
  });

const loginLimiter = createAuthLimiter("rl:auth:login:", {
  skipSuccessfulRequests: true,
});

const registerLimiter = createAuthLimiter("rl:auth:register:");

module.exports = {
  loginLimiter,
  registerLimiter,
  AUTH_WINDOW_MS,
  AUTH_MAX_REQUESTS,
};
