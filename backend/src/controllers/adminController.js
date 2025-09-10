const Seller = require("../models/seller");

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

    const seller = await Seller.findByIdAndUpdate(
      id,
      { status },
      { new: true, select: "-password" }
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller not found!" });
    }

    res
      .status(200)
      .json({
        message: `Seller status updated to ${status} successfully!`,
        data: seller,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Seller Status Updation failed!!",
      error: error.message,
    });
  }
};

module.exports = { updateSellerStatus, getAllSellers };
