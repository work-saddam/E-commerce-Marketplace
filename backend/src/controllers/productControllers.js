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
    let { sort = "newest", page = 1, limit } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 20) || 10;
    const skip = (page - 1) * limit;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };

    const sortCriteria = sortOptions[sort] || sortOptions.newest;

    const [products, total] = await Promise.all([
      Product.find({}).sort(sortCriteria).skip(skip).limit(limit),
      Product.countDocuments({}),
    ]);

    res.status(200).json({
      message: "Fetching products successfully!",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    });
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
    res.status(200).json({
      message: "Fetching product details successfully!",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Fetching product details failed!",
      error: error.message,
    });
  }
};

const getProductbyIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

    const products = await Product.find({ _id: { $in: ids } }).select(
      "title price image stock slug"
    );
    res.status(200).json({
      message: "Successfully fetch product details!",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products!",
      error: error.message,
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    let { q, sort = "newest", page = 1, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query required!" });
    }

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 20) || 10;
    const skip = (page - 1) * limit;

    const regex = new RegExp(q.trim(), "i");

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };
    const sortCriteria = sortOptions[sort] || sortOptions.newest;

    const result = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
            { "categoryData.name": { $regex: regex } },
          ],
        },
      },
      {
        $facet: {
          data: [
            { $sort: sortCriteria },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                price: 1,
                image: 1,
                stock: 1,
                slug: 1,
                isActive: 1,
                createdAt: 1,
                "category._id": "$categoryData._id",
                "category.name": "$categoryData.name",
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const products = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      message: "Products fetched successfully!",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Search failed!",
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
  getProductbyIds,
  searchProducts,
};
