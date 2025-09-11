const express = require("express");
const {
  updateSellerStatus,
  getAllSellers,
} = require("../controllers/adminController");
const { requireAdmin, userAuth } = require("../middlewares/authMiddleware");
const {
  addCategory,
  getAllCategory,
  editCategory,
  deleteCategory,
} = require("../controllers/categoryControllers");
const router = express.Router();

router.get("/sellers", userAuth, requireAdmin, getAllSellers);
router.put("/sellers/:id/:status", userAuth, requireAdmin, updateSellerStatus);

router.post("/categories", userAuth, requireAdmin, addCategory);
router.get("/categories", userAuth, requireAdmin, getAllCategory);
router.put("/categories/:id", userAuth, requireAdmin, editCategory);
router.delete("/categories/:id", userAuth, requireAdmin, deleteCategory);

module.exports = router;
