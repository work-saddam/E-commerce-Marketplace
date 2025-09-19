const express = require("express");
const {
  sellerRegister,
  sellerLogin,
  getSellerProfile,
} = require("../controllers/sellerController");
const { userAuth } = require("../middlewares/authMiddleware");
const {
  addProduct,
  getAllSellerProduct,
  deleteProduct,
  editProduct,
} = require("../controllers/productControllers");
const checkSellerStatus = require("../middlewares/checkSellerStatus");
const upload = require("../middlewares/multer");
const router = express.Router();

router.post("/register", sellerRegister);
router.post("/login", sellerLogin);
router.get("/profile", userAuth, getSellerProfile);

router.post(
  "/products",
  userAuth,
  checkSellerStatus,
  upload.single("productImage"),
  addProduct
);
router.get("/products", userAuth, getAllSellerProduct);
router.put(
  "/products/:id",
  userAuth,
  checkSellerStatus,
  upload.single("productImage"),
  editProduct
);
router.delete("/products/:id", userAuth, checkSellerStatus, deleteProduct);

module.exports = router;
