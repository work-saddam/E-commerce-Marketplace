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
