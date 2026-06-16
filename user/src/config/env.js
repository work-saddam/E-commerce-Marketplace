/**
 * Centralized environment variable wrapper
 */
export const env = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  API_TIMEOUT: (() => {
    const timeout = Number(import.meta.env.VITE_API_TIMEOUT);
    return Number.isFinite(timeout) && timeout > 0 ? timeout : 10000;
  })(),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
