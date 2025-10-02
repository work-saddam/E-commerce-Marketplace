const { default: slugify } = require("slugify");
const Product = require("../models/product");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryHelper");
const { validateProductData } = require("../utils/validation");

const addProduct = async (req, res) => {
  try {
    const error = validateProductData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
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
    res
      .status(500)
      .json({ message: "Fetching products failed!", error: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const error = validateProductData(req);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    let imageURL = product?.image?.url;
    let imagePublicId = product?.image?.public_id;

    if (req.file) {
      try {
        if (imagePublicId) {
          await deleteFromCloudinary(imagePublicId);
        }

        const uploadRes = await uploadToCloudinary(req.file.buffer, "products");
        imageURL = uploadRes.secure_url;
        imagePublicId = uploadRes.public_id;
      } catch (uploadErr) {
        return res.status(500).json({
          message: "Image upload failed!",
          error: uploadErr.message,
        });
      }
    }

    const { title, description, price, category, stock } = req.body;

    const baseSlug = slugify(title, { lower: true, strict: true });
    const newSlug = `${baseSlug}-${req.params.id}`;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      {
        title,
        description,
        price,
        category,
        slug: newSlug,
        stock: Number(stock),
        image: { url: imageURL, public_id: imagePublicId },
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Product updated successfully!", data: updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Product updation failed!", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      seller: req.user.id,
      _id: req.params.id,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    if (product.image?.public_id) {
      await deleteFromCloudinary(product.image.public_id);
    }

    await Product.findOneAndDelete({
      seller: req.user.id,
      _id: req.params.id,
    });

    res
      .status(200)
      .json({ message: "Product Deleted Successfully!", data: product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Product Deletion Failed!!", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    res
      .status(200)
      .json({ message: "Fetching products successfully!", data: products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching products failed!", error: error.message });
  }
};

const getProductbyId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    res
      .status(200)
      .json({
        message: "Fetching product details successfully!",
        data: product,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Fetching product details failed!",
        error: error.message,
      });
  }
};

module.exports = {
  addProduct,
  getAllSellerProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
  getProductbyId,
};
