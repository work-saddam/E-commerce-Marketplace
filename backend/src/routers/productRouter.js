const express = require("express");
const {
  getAllProducts,
  getProductbyId,
  getProductbyIds,
} = require("../controllers/productControllers");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductbyId);
router.post("/bulk", getProductbyIds);

module.exports = router;
