const mailQueue = require("../../queues/mail.queue");

const SEND_MAIL_JOB_NAME = "send-mail";

const assertPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Mail job payload must be an object");
  }

  if (!payload.templateKey) {
    throw new Error("Mail job payload must include templateKey");
  }

  if (!Array.isArray(payload.to) || payload.to.length === 0) {
    throw new Error("Mail job payload must include at least one recipient");
  }

  if (!payload.subject || !payload.html || !payload.text) {
    throw new Error("Mail job payload must include subject, html, and text");
  }

  if (!payload.idempotencyKey) {
    throw new Error("Mail job payload must include idempotencyKey");
  }
};

const enqueueMailJob = async (payload) => {
  assertPayload(payload);

  const jobId = payload.idempotencyKey;
  const existingJob = await mailQueue.getJob(jobId);

  if (existingJob) {
    return existingJob;
  }

  return mailQueue.add(SEND_MAIL_JOB_NAME, payload, {
    jobId,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 3600, // keep for 1 hour
      count: 50, // max 50 jobs
    },
    removeOnFail: false,
  });
};

module.exports = {
  SEND_MAIL_JOB_NAME,
  enqueueMailJob,
};
