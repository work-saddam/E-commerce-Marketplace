// middlewares/checkSellerStatus.js
const Seller = require("../models/seller");

const checkSellerStatus = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found!" });
    }

    if (seller.status !== "approved") {
      return res.status(403).json({
        message: "Your account is not approved yet. You cannot add products.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error verifying seller status",
      error: error.message,
    });
  }
};

module.exports = checkSellerStatus;
