const { Resend } = require("resend");
const {
  getMailWorkerConfig,
  validateMailWorkerConfig,
} = require("../config/mail");

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    const { resendApiKey } = getMailWorkerConfig();
    resendClient = new Resend(resendApiKey);
  }

  return resendClient;
};

const normalizeIdempotencyKey = (idempotencyKey) => {
  if (!idempotencyKey) {
    return undefined;
  }

  return String(idempotencyKey)
    .replace(/[^A-Za-z0-9_-]/g, "-")
    .slice(0, 255);
};

const normalizeTagPart = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value)
    .replace(/[^A-Za-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 255);

  return normalized || undefined;
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return undefined;
  }

  return tags
    .map((tag) => {
      const name = normalizeTagPart(tag?.name);
      const value = normalizeTagPart(tag?.value);

      if (!name || !value) {
        return null;
      }

      return { name, value };
    })
    .filter(Boolean);
};

const sendMail = async (payload) => {
  const client = getResendClient();
  const { mailFrom, mailReplyTo } = getMailWorkerConfig();
  const replyTo = payload.replyTo || mailReplyTo;
  const resendIdempotencyKey = normalizeIdempotencyKey(payload.idempotencyKey);
  const tags = normalizeTags(payload.tags);

  const { data, error } = await client.emails.send(
    {
      from: mailFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(replyTo ? { replyTo } : {}),
      ...(tags?.length ? { tags } : {}),
    },
    {
      idempotencyKey: resendIdempotencyKey,
    },
  );

  if (error) {
    const message =
      error.message || error.name || "Resend failed to send the email";
    throw new Error(message);
  }

  return data;
};

module.exports = {
  sendMail,
  validateConfiguration: validateMailWorkerConfig,
};
