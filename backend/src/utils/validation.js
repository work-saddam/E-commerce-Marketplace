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
    return { status: 400, message: "Invalid Phone number" };
  }
};

const validateUserEditProfileData = (req) => {
  const { name } = req.body;
  if (name.length < 3) {
    return { status: 400, message: "Invalid Name" };
  }
};

const validateAddressData = (req) => {
  const { name, phone, street, city, state, pincode, country } = req.body;

  if (!name || !phone || !street || !city || !state || !pincode || !country) {
    return { status: 400, message: "All fields is required" };
  } else if (name.length < 3) {
    return { status: 400, message: "Invalid Name" };
  } else if (!validator.isMobilePhone(phone)) {
    return { status: 400, message: "Invalid Phone number" };
  } else if (pincode.length !== 6) {
    return { status: 400, message: "Invalid Pincode" };
  }
};

module.exports = {
  validateUserRegisterData,
  validateUserEditProfileData,
  validateAddressData,
};
