const mongoose = require("mongoose");
const slugify = require("slugify");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    stock: {
      type: Number,
      default: 0,
    },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${this._id}`;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
