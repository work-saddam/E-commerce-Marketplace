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

const sendMail = async (payload) => {
  const client = getResendClient();
  const { mailFrom, mailReplyTo } = getMailWorkerConfig();
  const replyTo = payload.replyTo || mailReplyTo;

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
      idempotencyKey: payload.idempotencyKey,
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
