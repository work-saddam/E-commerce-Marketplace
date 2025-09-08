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
router.get("/address", userAuth, getAllAddress);
router.post("/address", userAuth, addAddress);
router.put("/address/:id", userAuth, editAddress);
router.delete("/address/:id", userAuth, deleteAddress);

module.exports = router;
