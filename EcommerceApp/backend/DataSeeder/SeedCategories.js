
import Category from "../models/category.model.js";
import { initializeDB } from "../db/db.connect.js";

const categoryUpdates = [
  {
    name: "Men",
    slug: "men",
    categoryURL:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
  },
  {
    name: "Women",
    slug: "women",
    categoryURL:
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
  },
  {
    name: "Kids",
    slug: "kids",
    categoryURL:
      "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
  },
  {
    name: "Accessories",
    slug: "accessories",
    categoryURL:
      "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
  },
];

async function seedCategories() {
  try {
    await initializeDB();

    await Category.deleteMany({});
    console.log("Old categories deleted");

    await Category.insertMany(categoryUpdates);
    console.log("Categories seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
