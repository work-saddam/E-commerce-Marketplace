const DEFAULT_RETRY_AFTER_SECONDS = 60;

const parseRetryAfterSeconds = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return Math.ceil(numericValue);
  }

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return Math.max(1, Math.ceil((parsedDate.getTime() - Date.now()) / 1000));
  }

  return null;
};

export const buildRateLimitMessage = (seconds) => {
  if (!seconds || seconds <= 0) {
    return "Too many attempts. Try again in about 1 minute.";
  }

  return `Too many attempts. Try again in ${seconds}s.`;
};

export const getRateLimitRetrySeconds = (error) => {
  if (error?.response?.status !== 429) {
    return null;
  }

  return (
    parseRetryAfterSeconds(error.response?.data?.retryAfter) ??
    parseRetryAfterSeconds(error.response?.headers?.["retry-after"]) ??
    parseRetryAfterSeconds(error.response?.headers?.["ratelimit-reset"]) ??
    DEFAULT_RETRY_AFTER_SECONDS
  );
};
