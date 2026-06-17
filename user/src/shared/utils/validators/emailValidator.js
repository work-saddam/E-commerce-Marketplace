/**
 * Validates whether an email string is in a correct email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
