
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

    await Products.deleteMany({});
    console.log("data deleted successfully");

    await Products.insertMany(productData);
    console.log("product data added successfully");

    process.exit(0);
  } catch (error) {
    console.log("product data is not added", error);
    process.exit(1);
  }
}

seedProduct();
