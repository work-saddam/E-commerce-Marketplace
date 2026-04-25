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

const sendMail = async (payload) => {
  const client = getResendClient();
  const { mailFrom, mailReplyTo } = getMailWorkerConfig();
  const replyTo = payload.replyTo || mailReplyTo;
  const resendIdempotencyKey = normalizeIdempotencyKey(payload.idempotencyKey);

  const { data, error } = await client.emails.send(
    {
      from: mailFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(replyTo ? { replyTo } : {}),
      tags: payload.tags,
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
