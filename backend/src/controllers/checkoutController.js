const mongoose = require("mongoose");

const InventoryService = require("../services/inventory.service");
const OrderService = require("../services/order.service");
const {
  addReleaseInventoryJob,
} = require("../jobs/inventory/releaseInventory");
const { validateCart } = require("../validations/cartValidator");

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
      const confirmResult = await OrderService.confirmOrders(masterOrder._id, session);
      if (!confirmResult) {
        await session.abortTransaction();
        throw createHttpError(409, "Order confirmation failed: status changed");
      }
      await session.commitTransaction();

      return res.json({ success: true, masterOrderId: masterOrder._id });
    }

    try {
      await addReleaseInventoryJob(masterOrder._id.toString());
    } catch (jobError) {
      console.error("Release inventory job scheduling failed:", {
        masterOrderId: masterOrder._id,
        message: jobError.message,
      });
      throw new Error("Unable to schedule inventory release job");
    }

    await session.commitTransaction();

    // 4. Razorpay continues separately
    res.json({ success: true, masterOrderId: masterOrder._id });
  } catch (error) {
    await session.abortTransaction();
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
