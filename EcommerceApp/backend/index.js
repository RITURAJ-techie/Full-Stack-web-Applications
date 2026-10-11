import dotenv from "dotenv";
import Products from "./models/product.model.js";
import Category from "./models/category.model.js";
import Address from "./models/address.model.js";
import Orders from "./models/orders.model.js";
import { initializeDB } from "./db/db.connect.js";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());

initializeDB();

//read all the products from db
async function allProducts() {
  try {
    const showProducts = await Products.find();
    return showProducts;
  } catch (error) {
    console.log("unable to fetch data from db");
  }
}

app.get("/api/products", async (req, res) => {
  try {
    const showData = await allProducts();
    if (!showData) {
      res.status(400).json({ error: "unable to get data" });
    }
    res.json(showData);
  } catch (error) {
    res.status(501).json({ error: "unable to fetch from api" });
  }
});

//read data by productId from db
async function productById(productId) {
  try {
    const showData = await Products.findOne({ _id: productId });
    return showData;
  } catch (error) {
    throw error;
  }
}

app.get("/api/products/:productId", async (req, res) => {
  try {
    const getId = req.params.productId;
    const showData = await productById(getId);
    if (showData) {
      res.status(200).json(showData);
    } else {
      res.status(400).json({ error: "id is not in DB" });
    }
  } catch (error) {
    res.status(501).json({ error: "found error while fetching data" });
  }
});

//read all data of category
async function allCategories() {
  try {
    const showCategories = await Category.find();
    return showCategories;
  } catch (error) {
    console.log("unable to fetch data from db");
  }
}

app.get("/api/categories", async (req, res) => {
  try {
    const showData = await allCategories();
    if (!showData) {
      res.status(400).json({ error: "unable to get data" });
    }
    res.json(showData);
  } catch (error) {
    res.status(501).json({ error: "unable to fetch from api" });
  }
});

//read data by categoryId from db
async function CategoryById(categoryId) {
  try {
    const showData = await Category.findOne({ _id: categoryId });
    return showData;
  } catch (error) {
    console.log("unable to fetch data from db", error);
  }
}

app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const getId = req.params.categoryId;
    const showData = await CategoryById(getId);
    if (showData) {
      res.status(200).json(showData);
    } else {
      res.status(400).json({ error: "id is not in DB" });
    }
  } catch (error) {
    res.status(501).json({ error: "found error while fetching data" });
  }
});

//Get Products by Category
app.get("/api/products/categories/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Products.find({ category: categoryId });
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "error fetching products" });
  }
});

//read all the data of address
async function alladdress() {
  try {
    const showItems = await Address.find();
    return showItems;
  } catch (error) {
    throw error;
  }
}

app.get("/api/address", async (req, res) => {
  try {
    const showAddress = await alladdress();
    if (!showAddress) {
      return res.status(400).json({ error: "address not found in DB" });
    }
    res.json(showAddress);
  } catch (error) {
    res.status(400).json({ error: "unable to fetch address" });
  }
});

//read data by addressId
async function showAddressById(itemId) {
  try {
    const showItems = await Address.findOne({ _id: itemId });
    return showItems;
  } catch (error) {
    throw error;
  }
}

app.get("/api/address/:addressId", async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const showAddress = await showAddressById(addressId);
    if (!showAddress) {
      return res.status(400).json({ error: "address not found in DB" });
    }
    res.json(showAddress);
  } catch (error) {
    res.status(400).json({ error: "unable to fetch address" });
  }
});

// add new address to the address table
async function addNewAddress(addNewData) {
  try {
    const newData = new Address(addNewData);
    const saveData = await newData.save();
    return saveData;
  } catch (error) {
    throw error;
  }
}

app.post("/api/address", async (req, res) => {
  try {
    const newData = req.body;
    await addNewAddress(newData);
    res.status(201).json({ message: "address added successfully" });
  } catch (error) {
    res.status(400).json({ error: "unable to add address" });
  }
});

//update address by address id
app.put("/api/address/:addressId", async (req, res) => {
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.addressId,
      req.body,
      { new: true },
    );

    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

//delete address from address table
async function removeMovies(itemId) {
  try {
    const deletedAddress = await Address.findByIdAndDelete(itemId);
    return deletedAddress;
  } catch (error) {
    console.log("unable to delete address", error);
  }
}

app.delete("/api/address/:addressId", async (req, res) => {
  try {
    const todelete = await removeMovies(req.params.addressId);
    if (todelete) {
      return res.status(200).json({ message: "address deleted successfully" });
    }
    res.status(404).json({ error: "Address not found" });
  } catch (error) {
    res.status(500).json({ error: "unale to fetch data to delete" });
  }
});

//read all order data
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Orders.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "unable to fetch from db" });
  }
});

//insert data into order table
async function addOrdersData(newData) {
  try {
    const addedData = new Orders(newData);
    await addedData.save();
  } catch (error) {
    throw error;
  }
}

app.post("/api/orders", async (req, res) => {
  try {
    const newData = req.body;
    await addOrdersData(newData);
    res.status(201).json({ message: "order added successfully" });
  } catch (error) {
    res.status(400).json({ error: "unable to add order" });
  }
});

//app running port
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 9000;
  app.listen(PORT, () => {
    console.log("app is running on port", PORT);
  });
}

export default app;