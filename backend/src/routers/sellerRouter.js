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
const upload = require("../middlewares/multer");
const { getOrderbyId } = require("../controllers/orderController");
const router = express.Router();

router.post("/register", sellerRegister);
router.post("/login", sellerLogin);
router.get("/profile", userAuth, getSellerProfile);

//product routes
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

//orders routes
router.get("/orders/get", userAuth, getSellerOrders);
router.get("/order/:id", userAuth, getOrderbyId);
router.put("/order/:id/:status", userAuth, updateOrderStatus);

module.exports = router;
