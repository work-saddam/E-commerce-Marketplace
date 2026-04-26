require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routers/authRouter");
const userRoutes = require("./routers/userRouter");
const sellerRoutes = require("./routers/sellerRouter");
const adminRoutes = require("./routers/adminRouter");
const bullBoardRouter = require("./routers/bullBoardRouter");
const productRoutes = require("./routers/productRouter");
const paymentRoutes = require("./routers/paymentRouter");
const { startMailWorker } = require("./workers/mail.worker");
const { startInventoryWorker } = require("./workers/inventory.worker");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://trustkart-lemon.vercel.app",
      "https://trustkart-seller.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      if (req.originalUrl === "/api/payment/webhook") {
        req.rawBody = buf.toString("utf8");
      }
    },
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin/queues", bullBoardRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);

const startServer = async () => {
  await connectDB();

  // Start Background Workers
  startInventoryWorker();
  startMailWorker();

  app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
