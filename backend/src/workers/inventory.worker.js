const { Worker } = require("bullmq");
const createRedisConnection = require("../config/redis");
const { INVENTORY_QUEUE } = require("../queues/queueNames");
const MasterOrder = require("../models/masterOrder");
const Payment = require("../models/payment");
const { isReservationExpired } = require("../config/orderReservation");
const InventoryService = require("../services/inventory.service");
const OrderService = require("../services/order.service");
const mongoose = require("mongoose");

let inventoryWorkerInstance = null;

const startInventoryWorker = () => {
  if (inventoryWorkerInstance) {
    return inventoryWorkerInstance;
  }

  inventoryWorkerInstance = new Worker(
    INVENTORY_QUEUE,
    async (job) => {
      if (job.name !== "release-inventory") return;

      const { masterOrderId } = job.data;
      const session = await mongoose.startSession();
      let didRelease = false;

      try {
        await session.withTransaction(async () => {
          const masterOrder = await MasterOrder.findById(masterOrderId)
            .select("paymentStatus reservationExpiresAt")
            .session(session)
            .lean();

          if (!masterOrder || masterOrder.paymentStatus !== "pending") {
            return;
          }

          if (!isReservationExpired(masterOrder.reservationExpiresAt)) {
            return;
          }

          const payment = await Payment.findOne({ masterOrder: masterOrderId })
            .sort({ createdAt: -1 })
            .select("status")
            .session(session)
            .lean();

          if (["captured", "paid", "success"].includes(payment?.status)) {
            return;
          }

          await InventoryService.releaseInventory(masterOrderId, session);
          await OrderService.failOrders(masterOrderId, session);

          didRelease = true;
        });

        if (didRelease) {
          console.info("Inventory released", {
            masterOrderId,
            jobId: job.id,
          });
        }
      } catch (err) {
        console.error("Release inventory failed", {
          masterOrderId,
          jobId: job.id,
          err,
        });
        throw err;
      } finally {
        session.endSession();
      }
    },
    {
      connection: createRedisConnection(),
    },
  );

  console.info("Inventory worker started", {
    queue: INVENTORY_QUEUE,
  });

  return inventoryWorkerInstance;
};

module.exports = { startInventoryWorker };
