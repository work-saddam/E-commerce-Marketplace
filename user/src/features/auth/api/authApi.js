import apiClient from "../../../shared/services/apiClient";

/**
 * Sends a login request to the server
 * @param {string} identifier (email or phone)
 * @param {string} password
 */
export const loginRequest = async (identifier, password) => {
  const response = await apiClient.post("/api/auth/login", {
    identifier,
    password,
  });
  return response.data;
};

/**
 * Sends a registration request to the server
 * @param {Object} details
 * @param {string} details.name
 * @param {string} details.phone
 * @param {string} details.email
 * @param {string} details.password
 */
export const registerRequest = async ({ name, phone, email, password }) => {
  const response = await apiClient.post("/api/auth/register", {
    name,
    phone,
    email,
    password,
  });
  return response.data;
};

/**
 * Verifies the OTP sent to user's email during registration
 * @param {string} email
 * @param {string} otp
 */
export const verifyOtpRequest = async (email, otp) => {
  const response = await apiClient.post("/api/auth/register/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

/**
 * Requests a password reset OTP code
 * @param {string} email
 */
export const requestForgotPasswordOtpRequest = async (email) => {
  const response = await apiClient.post("/api/auth/forgot-password/request-otp", {
    email,
    userType: "buyer",
  });
  return response.data;
};

/**
 * Verifies a password reset OTP code
 * @param {string} email
 * @param {string} otp
 */
export const verifyForgotPasswordOtpRequest = async (email, otp) => {
  const response = await apiClient.post("/api/auth/forgot-password/verify-otp", {
    email,
    otp,
    userType: "buyer",
  });
  return response.data;
};

/**
 * Resets password using token
 * @param {string} resetToken
 * @param {string} newPassword
 */
export const resetPasswordRequest = async (resetToken, newPassword) => {
  const response = await apiClient.post("/api/auth/forgot-password/reset-password", {
    resetToken,
    newPassword,
  });
  return response.data;
};
