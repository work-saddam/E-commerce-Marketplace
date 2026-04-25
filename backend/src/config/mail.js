const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`${name} is not defined in environment variables`);
  }

  return String(value).trim();
};

const getOptionalEnv = (name) => {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    return undefined;
  }

  return String(value).trim();
};

const getRequiredBaseUrl = (name) => {
  const value = getRequiredEnv(name);

  try {
    const url = new URL(value);
    return url.toString().replace(/\/+$/, "");
  } catch (_error) {
    throw new Error(`${name} must be a valid absolute URL`);
  }
};

const buildAppUrl = (baseUrl, path = "/") => {
  const normalizedBaseUrl = `${String(baseUrl).replace(/\/+$/, "")}/`;
  const normalizedPath = String(path || "").replace(/^\/+/, "");

  return new URL(normalizedPath, normalizedBaseUrl).toString();
};

const getMailWorkerConfig = () => ({
  resendApiKey: getRequiredEnv("RESEND_API_KEY"),
  mailFrom: getRequiredEnv("MAIL_FROM"),
  mailReplyTo: getOptionalEnv("MAIL_REPLY_TO"),
});

const getMailTemplateConfig = () => ({
  clientAppUrl: getRequiredBaseUrl("CLIENT_APP_URL"),
  sellerAppUrl: getRequiredBaseUrl("SELLER_APP_URL"),
  mailReplyTo: getOptionalEnv("MAIL_REPLY_TO"),
});

const validateMailWorkerConfig = () => {
  getMailWorkerConfig();
  getMailTemplateConfig();
};

module.exports = {
  buildAppUrl,
  getMailTemplateConfig,
  getMailWorkerConfig,
  validateMailWorkerConfig,
};
