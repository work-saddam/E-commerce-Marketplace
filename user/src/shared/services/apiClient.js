import axios from "axios";
import { env } from "../../config/env";

const apiClient = axios.create({
  baseURL: env.BASE_URL,
  timeout: env.API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for general error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error formats here if needed
    return Promise.reject(error);
  }
);

export default apiClient;
