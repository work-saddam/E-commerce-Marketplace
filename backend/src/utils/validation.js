const validator = require("validator");
const validateUserRegisterData = (req) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return { status: 400, message: "All fields is required" };
  } else if (name.length < 3) {
    return { status: 400, message: "Invalid Name" };
  } else if (!validator.isEmail(email)) {
    return { status: 400, message: "Invalid Email" };
  } else if (!validator.isStrongPassword(password)) {
    return { status: 400, message: "Password not Strong" };
  } else if (!validator.isMobilePhone(phone)) {
    return { status: 400, message: "Invalid Mobile number" };
  }
};

module.exports = { validateUserRegisterData };
