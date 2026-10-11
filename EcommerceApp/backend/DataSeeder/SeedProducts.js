import Products from "../models/product.model.js";
import { initializeDB } from "../db/db.connect.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedProduct() {
  try {
    await initializeDB();

    const jsonPath = path.join(__dirname, "productData.json");
    const jsonData = fs.readFileSync(jsonPath, "utf8");
    const productData = JSON.parse(jsonData);

    if (!Array.isArray(productData) || productData.length === 0) {
      throw new Error("productData.json must contain a non-empty array.");
    }

    for (const [index, product] of productData.entries()) {
      if (
        !product.productName ||
        !product.description ||
        !product.productImage ||
        !Number.isFinite(Number(product.price)) ||
        !product.category ||
        !Array.isArray(product.size)
      ) {
        throw new Error(
          `Invalid product data at index ${index}: ${
            product.productName || "Unnamed product"
          }`
        );
      }
    }

    const operations = productData.map((product) => ({
      updateOne: {
        filter: { productName: product.productName },
        update: { $setOnInsert: product },
        upsert: true,
      },
    }));

    const result = await Products.bulkWrite(operations, {
      ordered: true,
    });

    const totalProducts = await Products.countDocuments();

    console.log("Product seeding completed safely.");
    console.log("Products inserted:", result.upsertedCount);
    console.log("Products already existing:", result.matchedCount);
    console.log("Total products in database:", totalProducts);

    process.exit(0);
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exit(1);
  }
}

seedProduct();