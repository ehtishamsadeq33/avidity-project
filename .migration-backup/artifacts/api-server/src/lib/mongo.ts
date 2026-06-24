import mongoose from "mongoose";
import { logger } from "./logger";

let connectingPromise: Promise<typeof mongoose> | null = null;

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectingPromise) return connectingPromise;

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  connectingPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then((m) => {
      logger.info("MongoDB connected");
      return m;
    })
    .catch((err) => {
      connectingPromise = null;
      logger.error({ err }, "MongoDB connection failed");
      throw err;
    });

  return connectingPromise;
}
