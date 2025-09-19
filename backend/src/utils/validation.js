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

  return null;
};

const validateUserEditProfileData = (req) => {
  const { name } = req.body;
  if (name.length < 3) {
    return { status: 400, message: "Invalid Name" };
  }

  return null;
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

  return null;
};

const validateSellerRegisterData = (req) => {
  const { sellerName, shopName, email, password, phone, gstNumber, panNumber } =
    req.body;

  if (
    !sellerName ||
    !shopName ||
    !email ||
    !password ||
    !phone ||
    !gstNumber ||
    !panNumber
  ) {
    return { status: 400, message: "All fields is required" };
  } else if (sellerName.length < 3 || shopName < 3) {
    return { status: 400, message: "Invalid Name" };
  } else if (!validator.isEmail(email)) {
    return { status: 400, message: "Invalid Email" };
  } else if (!validator.isStrongPassword(password)) {
    return { status: 400, message: "Password not Strong" };
  } else if (!validator.isMobilePhone(phone)) {
    return { status: 400, message: "Invalid Phone number" };
  } else if (gstNumber.length !== 15) {
    return { status: 400, message: "GST Number must be 15 character" };
  } else if (panNumber.length !== 10) {
    return { status: 400, message: "PAN Number must be 10 character" };
  }

  return null;
};

const validateProductData = (req) => {
  const { title, description, price, stock } = req.body;

  if (!title || !description || !price || !stock) {
    return { status: 400, message: "All fields are required!" };
  } else if (title.length < 3 || title.length > 100) {
    return { status: 400, message: "title must be between 3-100 words!" };
  } else if (description.length < 10 || description.length > 500) {
    return {
      status: 400,
      message: "Description must be between 10-500 words!",
    };
  } else if (!validator.isNumeric(price.toString())) {
    return { status: 400, message: "Price must be number!" };
  } else if (!validator.isNumeric(stock.toString())) {
    return { status: 400, message: "Stock must be number!" };
  } else if (!req.file) {
    return { status: 400, message: "Product image is required!" };
  }

  return null;
};

module.exports = {
  validateUserRegisterData,
  validateUserEditProfileData,
  validateAddressData,
  validateSellerRegisterData,
  validateProductData,
};
