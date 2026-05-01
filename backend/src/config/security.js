const DEV_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const AUTH_COOKIE_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch (_error) {
    return null;
  }
};

const configuredOrigins = [
  process.env.CLIENT_APP_URL,
  process.env.SELLER_APP_URL,
].filter(Boolean);

const invalidProductionOrigins = configuredOrigins.filter((origin) => {
  try {
    return new URL(origin).protocol !== "https:";
  } catch (_error) {
    return true;
  }
});

if (isProduction && invalidProductionOrigins.length > 0) {
  throw new Error(
    `Production app origins must use HTTPS: ${invalidProductionOrigins.join(", ")}`,
  );
}

const appOrigins = configuredOrigins.map(normalizeOrigin).filter(Boolean);

if (isProduction && appOrigins.length === 0) {
  throw new Error(
    "CLIENT_APP_URL and SELLER_APP_URL must be configured for production",
  );
}

const allowedCorsOrigins = [
  ...(isProduction ? [] : DEV_CORS_ORIGINS),
  ...appOrigins,
];

const helmetOptions = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
};

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
});

const getAuthClearCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
});

const requireHttps = (req, res, next) => {
  if (!isProduction) {
    return next();
  }

  const forwardedProtoHeader = req.get("x-forwarded-proto");
  const forwardedProto = forwardedProtoHeader
    ? forwardedProtoHeader.split(",")[0].trim()
    : "";

  if (req.secure || forwardedProto === "https") {
    return next();
  }

  return res.status(426).json({
    message: "HTTPS is required in production",
  });
};

module.exports = {
  getAuthClearCookieOptions,
  getAuthCookieOptions,
  allowedCorsOrigins,
  helmetOptions,
  isProduction,
  requireHttps,
};
