const mongoose = require("mongoose");

const InventoryService = require("../services/inventory.service");
const OrderService = require("../services/order.service");
const {
  addReleaseInventoryJob,
} = require("../jobs/inventory/releaseInventory");
const { validateCart } = require("../validations/cartValidator");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const abortTransactionIfNeeded = async (session) => {
  if (session?.inTransaction()) {
    await session.abortTransaction();
  }
};

const rollbackPendingCheckout = async (masterOrderId) => {
  const cleanupSession = await mongoose.startSession();

  try {
    await cleanupSession.withTransaction(async () => {
      await InventoryService.releaseInventory(masterOrderId, cleanupSession);

      const failResult = await OrderService.failOrders(
        masterOrderId,
        cleanupSession,
      );

      if (!failResult) {
        throw createHttpError(
          409,
          "Order cleanup failed: status changed before rollback",
        );
      }
    });
  } finally {
    cleanupSession.endSession();
  }
};

exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { cart, addressId, paymentMethod } = req.body;

    const error = validateCart(cart);
    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ message: error });
    }

    if (!addressId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Address is required" });
    }

    if (!paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment method is required" });
    }
    // 1. Reserve inventory
    await InventoryService.reserveInventory(cart, session);

    // 2. Create order
    const masterOrder = await OrderService.createOrder({
      buyerId: req.user.id,
      cart,
      addressId,
      paymentMethod,
      session,
    });

    // 3. COD shortcut
    if (paymentMethod === "COD") {
      await InventoryService.confirmInventory(masterOrder._id, session);
      const confirmResult = await OrderService.confirmOrders(
        masterOrder._id,
        session,
      );
      if (!confirmResult) {
        throw createHttpError(409, "Order confirmation failed: status changed");
      }
      await session.commitTransaction();

      return res.json({ success: true, masterOrderId: masterOrder._id });
    }

    await session.commitTransaction();

    try {
      await addReleaseInventoryJob(masterOrder._id.toString());
    } catch (jobError) {
      console.error("Release inventory job scheduling failed:", {
        masterOrderId: masterOrder._id,
        message: jobError.message,
      });

      try {
        await rollbackPendingCheckout(masterOrder._id);
      } catch (cleanupError) {
        console.error("Rollback after scheduling failure also failed:", {
          masterOrderId: masterOrder._id,
          message: cleanupError.message,
        });
        throw createHttpError(
          500,
          "Unable to schedule inventory release job and rollback reservation",
        );
      }

      throw createHttpError(
        503,
        "Unable to schedule inventory release job. Reservation has been released.",
      );
    }

    // 4. Razorpay continues separately
    res.json({ success: true, masterOrderId: masterOrder._id });
  } catch (error) {
    await abortTransactionIfNeeded(session);
    console.error("Checkout Error:", error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
