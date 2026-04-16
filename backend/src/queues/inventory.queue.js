const { createQueue } = require("../config/bullmq");
const { INVENTORY_QUEUE } = require("./queueNames");

const inventoryQueue = createQueue(INVENTORY_QUEUE);

module.exports = inventoryQueue;
