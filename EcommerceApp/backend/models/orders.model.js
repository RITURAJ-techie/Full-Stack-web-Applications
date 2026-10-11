import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        productName: String,
        price: String,
        quantity: String,
        selectedsize: String,
      },
    ],
    address: {
      name: String,
      email: String,
      address: String,
      phone: String,
      pincode: String,
    },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Confirmed",
    },
  },
  { timestamps: true },
);

const Orders = new mongoose.model("Orders", OrderSchema);

export default Orders;