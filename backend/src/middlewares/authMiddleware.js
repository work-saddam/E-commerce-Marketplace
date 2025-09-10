const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Please Login Again" });
    }

    const payload = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

const requireAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server Error", error: error.message });
  }
};

module.exports = { userAuth, requireAdmin };
