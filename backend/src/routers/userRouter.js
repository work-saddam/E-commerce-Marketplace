const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { getProfile, editProfile, sendContactUpdateOtp, verifyContactUpdateOtp } = require("../controllers/profileController");
const {
  getAllAddress,
  addAddress,
  deleteAddress,
  editAddress,
} = require("../controllers/addressController");
const { getUserOrders } = require("../controllers/orderController");
const { checkout } = require("../controllers/checkoutController");
const router = express.Router();

router.get("/profile", userAuth, getProfile);
router.put("/profile", userAuth, editProfile);
router.post("/profile/contact/send-otp", userAuth, sendContactUpdateOtp);
router.put("/profile/contact/verify", userAuth, verifyContactUpdateOtp);
router.get("/address", userAuth, getAllAddress);
router.post("/address", userAuth, addAddress);
router.put("/address/:id", userAuth, editAddress);
router.delete("/address/:id", userAuth, deleteAddress);

router.post("/checkout", userAuth, checkout);
router.get("/orders", userAuth, getUserOrders);

module.exports = router;
