const express = require("express");
const helmet = require("helmet");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { userAuth, requireAdmin } = require("../middlewares/authMiddleware");
const { disableContentSecurityPolicy } = require("../config/security");
const inventoryQueue = require("../queues/inventory.queue");
const mailQueue = require("../queues/mail.queue");

const router = express.Router();
const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [new BullMQAdapter(inventoryQueue), new BullMQAdapter(mailQueue)],
  serverAdapter,
});

serverAdapter.setBasePath("/api/admin/queues");

router.use(userAuth, requireAdmin);
router.use(helmet({ contentSecurityPolicy: false }));
router.use(disableContentSecurityPolicy);
router.use(serverAdapter.getRouter());

module.exports = router;
