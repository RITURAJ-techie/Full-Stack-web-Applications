
import mongoose from "mongoose";
import Products from "../models/product.model.js";
import Category from "../models/category.model.js";
import { initializeDB } from "../db/db.connect.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCategorySlug(productName) {
  const name = productName.toLowerCase();

  let audience = "men";

  if (name.startsWith("women") || name.startsWith("women's")) {
    audience = "women";
  } else if (name.startsWith("kids")) {
    audience = "kids";
  }

  const accessories = [
    "watch",
    "wallet",
    "belt",
    "bag",
    "handbag",
    "perfume",
    "cap",
  ];

  const footwear = ["sneakers", "shoes", "sandals", "boots"];

  if (footwear.some((item) => name.includes(item))) {
    return `${audience}-footwear`;
  }

  if (accessories.some((item) => name.includes(item))) {
    return `${audience}-accessories`;
  }

  return `${audience}-clothing`;
}

async function seedProduct() {
  try {
    await initializeDB();

    const jsonPath = path.join(__dirname, "productData.json");
    const jsonData = fs.readFileSync(jsonPath, "utf8");
    const productData = JSON.parse(jsonData);

    if (!Array.isArray(productData) || productData.length === 0) {
      throw new Error("productData.json must contain a non-empty array.");
    }

    const categories = await Category.find({
      slug: {
        $in: [
          "men-clothing",
          "men-footwear",
          "men-accessories",
          "women-clothing",
          "women-footwear",
          "women-accessories",
          "kids-clothing",
          "kids-footwear",
          "kids-accessories",
        ],
      },
    });

    const categoryMap = new Map(
      categories.map((category) => [category.slug, category._id]),
    );

    const operations = productData.map((product, index) => {
      if (
        !product.productName ||
        !product.description ||
        !product.productImage ||
        !Number.isFinite(Number(product.price)) ||
        !Array.isArray(product.size)
      ) {
        throw new Error(
          `Invalid product data at index ${index}: ${
            product.productName || "Unnamed product"
          }`,
        );
      }

      const categorySlug = getCategorySlug(product.productName);
      const categoryId = categoryMap.get(categorySlug);

      if (!categoryId) {
        throw new Error(
          `Category "${categorySlug}" not found for "${product.productName}". Run SeedCategories.js first.`,
        );
      }

      return {
        updateOne: {
          filter: { productName: product.productName },
          update: {
            $set: {
              ...product,
              category: categoryId,
              price: Number(product.price),
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Products.bulkWrite(operations, {
      ordered: true,
    });

    console.log("Product seeding completed successfully.");
    console.log("Products inserted:", result.upsertedCount);
    console.log("Products updated:", result.modifiedCount);
    console.log("Total products in database:", await Products.countDocuments());
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

await seedProduct();
