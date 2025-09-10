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

app.use(cors());
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
