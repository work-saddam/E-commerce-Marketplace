const Address = require("../models/address");
const { validateAddressData } = require("../utils/validation");

const addAddress = async (req, res) => {
  try {
    const error = validateAddressData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { name, phone, street, city, state, pincode, country } = req.body;

    const address = new Address({
      user: req.user.id,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      country,
    });
    const savedAddress = await address.save();

    res
      .status(201)
      .json({ message: "Address Added Successfully!", data: savedAddress });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Add Address Failed!!", error: error.message });
  }
};

const getAllAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res
      .status(200)
      .json({ message: "Addresses Fetched Successfully!!", data: addresses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Addresses Fetch Failed!!", error: error.message });
  }
};

const editAddress = async (req, res) => {
  try {
    const error = validateAddressData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { name, phone, street, city, state, pincode, country } = req.body;

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, phone, street, city, state, pincode, country },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Address Updated Successfully!", data: address });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Address Updation Failed!!", error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found!!" });
    }

    res.status(200).json({ message: "Address Deleted Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Address Deletion Failed!!", error: error.message });
  }
};

module.exports = { getAllAddress, addAddress, editAddress, deleteAddress };
