const mongoose = require("mongoose");

const InventoryService = require("../services/inventory.service");
const OrderService = require("../services/order.service");
const { validateCart } = require("../validations/cartValidator");

exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { cart, addressId, paymentMethod } = req.body;

    const error = validateCart(cart);
    if (error) {
      return res.status(400).json({ message: error });
    }

    if (!addressId) {
      return res.status(400).json({ message: "Address is required" });
    }

    if (!paymentMethod) {
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
      return res.json({ success: true, masterOrderId: masterOrder._id });
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
