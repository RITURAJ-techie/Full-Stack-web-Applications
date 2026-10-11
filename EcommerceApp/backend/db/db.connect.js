
import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

async function initializeDB() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(uri);
    console.log("db connected successfully");
  } catch (error) {
    console.error("unable to connect", error);
    throw error;
  }
}

export { initializeDB };
