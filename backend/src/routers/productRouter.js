const express = require("express");
const {
  getAllProducts,
  getProductbyId,
} = require("../controllers/productControllers");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductbyId);

module.exports = router;
