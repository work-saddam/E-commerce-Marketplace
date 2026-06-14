/**
 * Standard error extractor for Axios requests
 * @param {Error} error
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";

  // Handle rate limits
  if (error.response?.status === 429) {
    const retryAfter = getRetrySeconds(error) || 60;
    return `Too many attempts. Try again in ${retryAfter}s.`;
  }

  // Handle standard server error responses
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle network or configuration errors
  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred. Please check your connection.";
};

/**
 * Helper to check and extract rate-limit retry time
 * @param {Error} error
 * @returns {number|null} seconds to wait
 */
export const getRetrySeconds = (error) => {
  if (error?.response?.status !== 429) return null;

  const retryAfter = error.response?.data?.retryAfter || 
                     error.response?.headers?.["retry-after"] || 
                     error.response?.headers?.["ratelimit-reset"];
                     
  if (!retryAfter) return 60; // default 60s
  
  const parsed = Number(retryAfter);
  if (Number.isFinite(parsed) && parsed > 0) return Math.ceil(parsed);
  
  const dateParsed = new Date(retryAfter);
  if (!Number.isNaN(dateParsed.getTime())) {
    return Math.max(1, Math.ceil((dateParsed.getTime() - Date.now()) / 1000));
  }

  return 60;
};
