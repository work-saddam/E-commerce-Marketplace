const crypto = require("crypto");

/**
 * Verifies the Razorpay webhook signature.
 * @param {Buffer} rawBody - The raw request body received from Razorpay.
 * @param {string} signature - The X-Razorpay-Signature header value.
 * @param {string} secret - Your Razorpay webhook secret.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
const verifySignature = (rawBody, signature, secret) => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
};

module.exports = {
  verifySignature,
};
