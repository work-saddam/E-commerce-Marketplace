const mongoose = require("mongoose");

const InventoryService = require("../services/inventory.service");
const OrderService = require("../services/order.service");

exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { cart, addressId, paymentMethod } = req.body;

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

    await session.commitTransaction();

    // 3. COD shortcut
    if (paymentMethod === "COD") {
      await InventoryService.confirmInventory(masterOrder._id, session);
      return res.json({ success: true, masterOrderId: masterOrder._id });
    }

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
