import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import Products from "./models/product.model.js";
import Category from "./models/category.model.js";
import Address from "./models/address.model.js";
import Orders from "./models/orders.model.js";
import { initializeDB } from "./db/db.connect.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

initializeDB();

// Products

app.get("/api/products", async (req, res) => {
  try {
    const products = await Products.find();
    return res.status(200).json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    return res.status(500).json({ error: "Unable to fetch products" });
  }
});

app.get("/api/products/:productId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Products.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Fetch product error:", error);
    return res.status(500).json({ error: "Unable to fetch product" });
  }
});

// Categories

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    return res.status(500).json({ error: "Unable to fetch categories" });
  }
});

app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Fetch category error:", error);
    return res.status(500).json({ error: "Unable to fetch category" });
  }
});

// Products by category

app.get("/api/products/categories/:categoryId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const products = await Products.find({
      category: req.params.categoryId,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Fetch category products error:", error);
    return res.status(500).json({ error: "Unable to fetch products" });
  }
});

// Addresses: authenticated users only

app.get("/api/address", authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(addresses);
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return res.status(500).json({ error: "Unable to fetch addresses" });
  }
});

app.get("/api/address/:addressId", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.addressId)) {
      return res.status(400).json({ error: "Invalid address ID" });
    }

    const address = await Address.findOne({
      _id: req.params.addressId,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    return res.status(200).json(address);
  } catch (error) {
    console.error("Fetch address error:", error);
    return res.status(500).json({ error: "Unable to fetch address" });
  }
});

app.post("/api/address", authenticateToken, async (req, res) => {
  try {
    const { name, email, address, phone, pincode } = req.body;

    if (
      ![name, email, address, phone, pincode].every(
        (value) => typeof value === "string" && value.trim(),
      )
    ) {
      return res.status(400).json({
        error: "Name, email, address, phone and pincode are required",
      });
    }

    const savedAddress = await Address.create({
      user: req.user._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: savedAddress,
    });
  } catch (error) {
    console.error("Create address error:", error);
    return res.status(400).json({ error: "Unable to add address" });
  }
});

app.put("/api/address/:addressId", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.addressId)) {
      return res.status(400).json({ error: "Invalid address ID" });
    }

    const allowedFields = ["name", "email", "address", "phone", "pincode"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          !req.body[field].trim()
        ) {
          return res.status(400).json({
            error: `${field} must be a non-empty string`,
          });
        }

        updates[field] =
          field === "email"
            ? req.body[field].trim().toLowerCase()
            : req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Provide at least one field to update",
      });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: req.params.addressId,
        user: req.user._id,
      },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }

    return res.status(200).json(updatedAddress);
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(400).json({ error: "Unable to update address" });
  }
});

app.delete(
  "/api/address/:addressId",
  authenticateToken,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.addressId)) {
        return res.status(400).json({ error: "Invalid address ID" });
      }

      const deletedAddress = await Address.findOneAndDelete({
        _id: req.params.addressId,
        user: req.user._id,
      });

      if (!deletedAddress) {
        return res.status(404).json({ error: "Address not found" });
      }

      return res.status(200).json({
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Delete address error:", error);
      return res.status(500).json({ error: "Unable to delete address" });
    }
  },
);

// Orders: authenticated users only

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Orders.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({ error: "Unable to fetch orders" });
  }
});

app.get("/api/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Orders.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Fetch order error:", error);
    return res.status(500).json({ error: "Unable to fetch order" });
  }
});

app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, address } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Your order must contain at least one item",
      });
    }

    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return res.status(400).json({
        error: "A delivery address is required",
      });
    }

    const requiredAddressFields = [
      "name",
      "email",
      "address",
      "phone",
      "pincode",
    ];

    for (const field of requiredAddressFields) {
      if (
        typeof address[field] !== "string" ||
        !address[field].trim()
      ) {
        return res.status(400).json({
          error: `A valid ${field} is required`,
        });
      }
    }

    const requestedItems = [];

    for (const item of items) {
      if (!item || typeof item !== "object") {
        return res.status(400).json({
          error: "Invalid item in order",
        });
      }

      let productId = item.productId ?? item._id ?? item.id;

      if (productId && typeof productId === "object") {
        productId = productId._id ?? productId.id;
      }

      const quantity = Number(item.quantity);
      const selectedSize =
        item.selectedSize ?? item.selectedsize ?? null;

      if (
        typeof productId !== "string" ||
        !mongoose.isValidObjectId(productId) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return res.status(400).json({
          error: "Invalid product ID or quantity in order",
        });
      }

      requestedItems.push({
        productId,
        quantity,
        selectedSize:
          typeof selectedSize === "string" ? selectedSize : null,
      });
    }

    const uniqueProductIds = [
      ...new Set(requestedItems.map((item) => item.productId)),
    ];

    const products = await Products.find({
      _id: { $in: uniqueProductIds },
    });

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    const missingProductIds = uniqueProductIds.filter(
      (id) => !productMap.has(id)
    );

    if (missingProductIds.length > 0) {
      console.error("Products missing from database:", missingProductIds);

      return res.status(400).json({
        error:
          "Some products in your cart are no longer available. Refresh the products and add them to your cart again.",
        missingProductIds,
      });
    }

    let subtotal = 0;
    let discountAmount = 0;

    const orderItems = [];

    for (const item of requestedItems) {
      const product = productMap.get(item.productId);

      const price = Number(product.price);
      const discountPercent = Math.min(
        50,
        Math.max(0, Number(product.discountedPrice) || 0)
      );

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          error: `Product "${product.productName}" has an invalid price`,
        });
      }

      const unitPrice = Math.round(
        price * (1 - discountPercent / 100)
      );

      subtotal += price * item.quantity;
      discountAmount += (price - unitPrice) * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        price,
        discountPercent,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
      });
    }

    subtotal = Math.round(subtotal);
    discountAmount = Math.round(discountAmount);

    const deliveryCharge = 100;
    const totalAmount = subtotal - discountAmount + deliveryCharge;

    const savedOrder = await Orders.create({
      user: req.user._id,
      items: orderItems,
      address: {
        name: address.name.trim(),
        email: address.email.trim().toLowerCase(),
        address: address.address.trim(),
        phone: address.phone.trim(),
        pincode: address.pincode.trim(),
      },
      subtotal,
      discountAmount,
      deliveryCharge,
      totalAmount,
      orderStatus: "Confirmed",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      error: "Unable to place order",
    });
  }
});

// Health check

app.get("/api/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// Server

const PORT = process.env.PORT || 9000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
