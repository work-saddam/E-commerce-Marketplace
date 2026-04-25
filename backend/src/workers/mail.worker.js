const { Worker } = require("bullmq");
const createRedisConnection = require("../config/redis");
const { SEND_MAIL_JOB_NAME } = require("../jobs/mail/sendMail");
const { MAIL_QUEUE } = require("../queues/queueNames");
const MailService = require("../services/mail.service");

let mailWorkerInstance = null;

const startMailWorker = () => {
  if (mailWorkerInstance) {
    return mailWorkerInstance;
  }

  MailService.validateConfiguration();

  mailWorkerInstance = new Worker(
    MAIL_QUEUE,
    async (job) => {
      if (job.name !== SEND_MAIL_JOB_NAME) {
        console.warn("Skipping unsupported mail job", {
          jobId: job.id,
          name: job.name,
        });
        return;
      }

      const response = await MailService.sendMail(job.data);

      console.info("Mail job processed", {
        jobId: job.id,
        templateKey: job.data.templateKey,
        recipients: job.data.to,
        resendId: response?.id,
      });
    },
    {
      connection: createRedisConnection(),
      concurrency: 5,
    },
  );

  mailWorkerInstance.on("failed", (job, error) => {
    console.error("Mail worker job failed", {
      jobId: job?.id,
      templateKey: job?.data?.templateKey,
      error: error.message,
    });
  });

  console.info("Mail worker started", {
    queue: MAIL_QUEUE,
  });

  return mailWorkerInstance;
};

module.exports = { startMailWorker };
