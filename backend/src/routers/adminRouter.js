const express = require("express");
const {
  updateSellerStatus,
  getAllSellers,
} = require("../controllers/adminController");
const { requireAdmin, userAuth } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/sellers", userAuth, requireAdmin, getAllSellers);
router.put("/sellers/:status/:id", userAuth, requireAdmin, updateSellerStatus);

module.exports = router;
