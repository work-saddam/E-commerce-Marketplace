const inventoryQueue = require("../../queues/inventory.queue");
const { ORDER_RESERVATION_DELAY_MS } = require("../../config/orderReservation");

const RELEASE_INVENTORY_JOB_NAME = "release-inventory";
const buildReleaseJobId = (masterOrderId) =>
  `inventory:release:${masterOrderId}`;

const safelyRemoveJob = async (job, masterOrderId, state) => {
  try {
    await job.remove();
    return true;
  } catch (error) {
    console.warn("Could not remove release inventory job", {
      masterOrderId,
      jobId: job.id,
      state,
      message: error.message,
    });
    return false;
  }
};

exports.addReleaseInventoryJob = async (masterOrderId, delayMs) => {
  const finalDelayMs = delayMs ?? ORDER_RESERVATION_DELAY_MS;
  const jobId = buildReleaseJobId(masterOrderId);
  const existingJob = await inventoryQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();

    if (state === "delayed") {
      await existingJob.changeDelay(finalDelayMs);
      return existingJob;
    }

    if (state === "active") {
      return existingJob;
    }

    if (state === "waiting" && finalDelayMs === 0) {
      return existingJob;
    }

    const removed = await safelyRemoveJob(existingJob, masterOrderId, state);
    if (!removed) {
      return existingJob;
    }
  }

  await inventoryQueue.add(
    RELEASE_INVENTORY_JOB_NAME,
    { masterOrderId },
    {
      jobId,
      delay: finalDelayMs,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
};

exports.removeReleaseInventoryJob = async (masterOrderId) => {
  const jobId = buildReleaseJobId(masterOrderId);
  const existingJob = await inventoryQueue.getJob(jobId);

  if (!existingJob) {
    return false;
  }

  const state = await existingJob.getState();

  if (state === "active") {
    console.warn("Release inventory job is already active and cannot be removed", {
      masterOrderId,
      jobId,
    });
    return false;
  }

  return safelyRemoveJob(existingJob, masterOrderId, state);
};
