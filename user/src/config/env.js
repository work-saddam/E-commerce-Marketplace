/**
 * Centralized environment variable wrapper
 */
export const env = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
