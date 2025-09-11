const Category = require("../models/category");
const slugify = require("slugify");

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required!" });
    }

    const category = new Category({
      name,
    });
    const saveCategory = await category.save();
    res
      .status(201)
      .json({ message: "Category added successfully!", data: saveCategory });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Category add failed!", error: error.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({
      message: "Categories fetched successfully!",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Fetching categories failed!",
      error: error.message,
    });
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required!" });
    }

    const baseSlug = slugify(name, { lower: true, strict: true });
    const newSlug = `${baseSlug}-${id}`;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug: newSlug },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }
    res.status(200).json({
      message: "Category updated successfully!",
      data: category,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Category updation failed!", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }
    res.status(200).json({
      message: "Category deleted successfully!",
      data: category,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Category deletion failed!", error: error.message });
  }
};

module.exports = { addCategory, getAllCategory, editCategory, deleteCategory };
