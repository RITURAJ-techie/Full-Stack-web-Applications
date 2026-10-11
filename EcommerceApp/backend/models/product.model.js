import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, min: 100, max: 5000, required: true },
    rating: { type: Number, min: 0, max: 5 },
    size: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "One Size", "50ml", "100ml"],
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    discountedPrice: { type: Number, min: 0, max: 50 },
  },
  { timestamps: true },
);

const Products = new mongoose.model("Products", productSchema);

export default Products;