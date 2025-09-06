const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connect successfullly");
  } catch (error) {
    console.error("Database not connected!!");
  }
};

module.exports = connectDB;
