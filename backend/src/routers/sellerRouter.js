const express = require("express");
const {
  sellerRegister,
  sellerLogin,
  getSellerProfile,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/sellerController");
const { userAuth } = require("../middlewares/authMiddleware");
const {
  addProduct,
  getAllSellerProduct,
  deleteProduct,
  editProduct,
} = require("../controllers/productControllers");
const checkSellerStatus = require("../middlewares/checkSellerStatus");
const { loginLimiter, registerLimiter } = require("../middlewares/authRateLimit");
const { singleImageUpload } = require("../middlewares/multer");
const { getOrderbyId } = require("../controllers/orderController");
const router = express.Router();

router.post("/register", registerLimiter, sellerRegister);
router.post("/login", loginLimiter, sellerLogin);
router.get("/profile", userAuth, getSellerProfile);

//product routes
router.post(
  "/products",
  userAuth,
  checkSellerStatus,
  singleImageUpload("productImage"),
  addProduct
);
router.get("/products", userAuth, getAllSellerProduct);
router.put(
  "/products/:id",
  userAuth,
  checkSellerStatus,
  singleImageUpload("productImage"),
  editProduct
);
router.delete("/products/:id", userAuth, checkSellerStatus, deleteProduct);

//orders routes
router.get("/orders/get", userAuth, getSellerOrders);
router.get("/order/:id", userAuth, getOrderbyId);
router.put("/order/:id/:status", userAuth, updateOrderStatus);

module.exports = router;
