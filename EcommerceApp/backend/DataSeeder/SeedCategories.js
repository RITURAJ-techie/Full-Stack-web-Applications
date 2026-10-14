
import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { initializeDB } from "../db/db.connect.js";

const categoryGroups = [
  {
    name: "Men",
    slug: "men",
    categoryURL:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
    children: [
      { name: "Clothing", slug: "men-clothing" },
      { name: "Footwear", slug: "men-footwear" },
      { name: "Accessories", slug: "men-accessories" },
    ],
  },
  {
    name: "Women",
    slug: "women",
    categoryURL:
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
    children: [
      { name: "Clothing", slug: "women-clothing" },
      { name: "Footwear", slug: "women-footwear" },
      { name: "Accessories", slug: "women-accessories" },
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    categoryURL:
      "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop",
    children: [
      { name: "Clothing", slug: "kids-clothing" },
      { name: "Footwear", slug: "kids-footwear" },
      { name: "Accessories", slug: "kids-accessories" },
    ],
  },
];

async function upsertCategory(data) {
  return Category.findOneAndUpdate(
    { slug: data.slug },
    { $set: data },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function seedCategories() {
  try {
    await initializeDB();

    for (const group of categoryGroups) {
      const { children, ...parentData } = group;
      const parent = await upsertCategory({
        ...parentData,
        parentCategory: null,
      });

      for (const child of children) {
        await upsertCategory({
          ...child,
          parentCategory: parent._id,
        });
      }
    }

    console.log("WearVeird category hierarchy seeded successfully.");
    console.log("Parents: Men, Women, Kids");
    console.log("Subcategories: Clothing, Footwear, Accessories");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

await seedCategories();
