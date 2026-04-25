require("dotenv").config();
const connectDB = require("./config/database");
const { startMailWorker } = require("./workers/mail.worker");
const { startInventoryWorker } = require("./workers/inventory.worker");

const startWorker = async () => {
  await connectDB();
  startInventoryWorker();
  startMailWorker();

  console.info("Queue worker process started");
};

startWorker().catch((error) => {
  console.error("Worker startup failed", error);
  process.exit(1);
});
