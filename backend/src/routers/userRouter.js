const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { getProfile, editProfile } = require("../controllers/profileController");
const {
  getAllAddress,
  addAddress,
  deleteAddress,
  editAddress,
} = require("../controllers/addressController");
const router = express.Router();

router.get("/profile", userAuth, getProfile);
router.put("/profile", userAuth, editProfile);

module.exports = router;
