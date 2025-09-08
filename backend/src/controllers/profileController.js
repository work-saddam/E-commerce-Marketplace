const User = require("../models/user");
const { validateUserEditProfileData } = require("../utils/validation");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "Profile Fetched Successfully", data: user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Profile Fetch Failed!!", error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const error = validateUserEditProfileData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated Successfully!!", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Edit User Failed!", error: error.message });
  }
};

module.exports = { getProfile, editProfile };
