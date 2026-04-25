const Seller = require("../models/seller");
const TransactionalMailService = require("../services/transactionalMail.service");

const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({}).select("-password");
    return res
      .status(200)
      .json({ message: "Seller list fetched successfully!", data: sellers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Fetching seller list failed!", error: error.message });
  }
};

const updateSellerStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    const allowedStatus = ["pending", "approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found!" });
    }

    const sellerData = () => {
      const data = seller.toObject();
      delete data.password;
      return data;
    };

    if (seller.status === status) {
      return res.status(200).json({
        message: `Seller status is already ${status}`,
        data: sellerData(),
      });
    }

    seller.status = status;
    await seller.save();

    if (["approved", "rejected"].includes(status)) {
      try {
        await TransactionalMailService.queueSellerStatusEmail({
          sellerId: seller._id.toString(),
          status,
        });
      } catch (mailError) {
        console.error("Failed to enqueue seller status email", {
          sellerId: seller._id,
          status,
          message: mailError.message,
        });
      }
    }

    res
      .status(200)
      .json({
        message: `Seller status updated to ${status} successfully!`,
        data: sellerData(),
      });
  } catch (error) {
    return res.status(500).json({
      message: "Seller Status Updation failed!!",
      error: error.message,
    });
  }
};

module.exports = { updateSellerStatus, getAllSellers };
