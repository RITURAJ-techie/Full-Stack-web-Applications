
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    categoryURL: {
      type: String,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true },
);

categorySchema.index(
  { name: 1, parentCategory: 1 },
  { unique: true },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
