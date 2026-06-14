/**
 * Validates password strength (e.g., minimum 6 characters)
 * @param {string} password
 * @returns {boolean}
 */
export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};
