const express = require("express");
const {
  sellerRegister,
  sellerLogin,
  getSellerProfile,
} = require("../controllers/sellerController");
const { userAuth } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", sellerRegister);
router.post("/login", sellerLogin);
router.get("/profile", userAuth, getSellerProfile);

module.exports = router;
