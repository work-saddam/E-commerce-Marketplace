require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/database");

app.use(cors());
app.use(express.json());

connectDB();

app.use("/", (req, res) => {
  res.send("Home");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
