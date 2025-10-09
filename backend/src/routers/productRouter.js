const express = require("express");
const {
  getAllProducts,
  getProductbyId,
  getProductbyIds,
  searchProducts,
} = require("../controllers/productControllers");
const router = express.Router();

router.get("/search", searchProducts);
router.post("/bulk", getProductbyIds);
router.get("/:id", getProductbyId);
router.get("/", getAllProducts);

module.exports = router;
