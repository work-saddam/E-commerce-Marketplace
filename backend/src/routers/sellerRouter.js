const express = require("express");
const {
  sellerRegister,
  sellerLogin,
} = require("../controllers/sellerController");
const router = express.Router();

router.post("/register", sellerRegister);
router.post("/login", sellerLogin);

module.exports = router;
