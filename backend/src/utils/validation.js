const validator = require("validator");

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeEmail = (value) => {
  const normalized = normalizeString(value);
  return typeof normalized === "string" ? normalized.toLowerCase() : normalized;
};

const normalizePhone = (value) => normalizeString(value);

const normalizeIdentifier = (value) => {
  const normalized = normalizeString(value);
  if (typeof normalized !== "string") {
    return normalized;
  }

  return validator.isEmail(normalized) ? normalized.toLowerCase() : normalized;
};

const validateUserRegisterData = (req) => {
  const name = normalizeString(req.body.name);
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const { password } = req.body;

  req.body.name = name;
  req.body.email = email;
  req.body.phone = phone;

  if (!name || !email || !password || !phone) {
    return { status: 400, message: "All fields are required" };
  }

  if (name.length < 3) {
    return { status: 400, message: "Name must be at least 3 characters" };
  }

  if (!validator.isEmail(email)) {
    return { status: 400, message: "Invalid email format" };
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return {
      status: 400,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
    };
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return { status: 400, message: "Phone must be 10 digits" };
  }

  return null;
};

const validateLoginData = (req) => {
  const identifier = normalizeIdentifier(req.body.identifier);
  const { password } = req.body;

  req.body.identifier = identifier;

  if (!identifier || !password) {
    return { status: 400, message: "All fields are required" };
  }

  const isValidEmail = validator.isEmail(identifier);
  const isValidPhone = /^[0-9]{10}$/.test(identifier);

  if (!isValidEmail && !isValidPhone) {
    return { status: 400, message: "Invalid email or phone number" };
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
  const sellerName = normalizeString(req.body.sellerName);
  const shopName = normalizeString(req.body.shopName);
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const gstNumber = normalizeString(req.body.gstNumber);
  const panNumber = normalizeString(req.body.panNumber);
  const { password } = req.body;

  req.body.sellerName = sellerName;
  req.body.shopName = shopName;
  req.body.email = email;
  req.body.phone = phone;
  req.body.gstNumber = gstNumber;
  req.body.panNumber = panNumber;

  if (
    !sellerName ||
    !shopName ||
    !email ||
    !password ||
    !phone ||
    !gstNumber ||
    !panNumber
  ) {
    return { status: 400, message: "All fields are required" };
  }

  if (sellerName.length < 3 || shopName.length < 3) {
    return {
      status: 400,
      message: "Seller name and shop name must be at least 3 characters",
    };
  }

  if (!validator.isEmail(email)) {
    return { status: 400, message: "Invalid email format" };
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return {
      status: 400,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
    };
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return { status: 400, message: "Phone must be 10 digits" };
  }

  if (gstNumber.length !== 15) {
    return { status: 400, message: "GST Number must be 15 characters" };
  }

  if (panNumber.length !== 10) {
    return { status: 400, message: "PAN Number must be 10 characters" };
  }

  return null;
};

const validateSellerLoginData = (req) => {
  const identifier = normalizeIdentifier(req.body.identifier);
  const { password } = req.body;

  req.body.identifier = identifier;

  if (!identifier || !password) {
    return { status: 400, message: "All fields are required" };
  }

  const isValidEmail = validator.isEmail(identifier);
  const isValidPhone = /^[0-9]{10}$/.test(identifier);

  if (!isValidEmail && !isValidPhone) {
    return { status: 400, message: "Invalid email or phone number" };
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
  validateLoginData,
  validateSellerRegisterData,
  validateSellerLoginData,
  validateUserEditProfileData,
  validateAddressData,
  validateProductData,
};
