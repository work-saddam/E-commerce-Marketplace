const Product = require("../models/product");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");
const { validateProductData } = require("../utils/validation");

const addProduct = async (req, res) => {
  try {
    const error = validateProductData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required!" });
    }

    let imageURL, imagePublicId;

    try {
      const uploadRes = await uploadToCloudinary(req.file.buffer, "products");
      imageURL = uploadRes.secure_url;
      imagePublicId = uploadRes.public_id;
    } catch (uploadErr) {
      return res.status(500).json({
        message: "Image upload failed!",
        error: uploadErr.message,
      });
    }

    const { title, description, price, category, stock } = req.body;

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      seller: req.user.id,
      stock: Number(stock),
      image: { url: imageURL, public_id: imagePublicId },
    });

    res
      .status(201)
      .json({ message: "Product added successfully!", data: product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding product!", error: error.message });
  }
};

const getAllSellerProduct = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res
      .status(200)
      .json({ message: "Products fetch successfully!", data: products });
  } catch (error) {
    res.status(500).json({ message: "Fetching products failed!" });
  }
};
module.exports = { addProduct, getAllSellerProduct };
