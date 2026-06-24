import mongoose from "mongoose";
import { logger } from "./logger";

let connectingPromise: Promise<typeof mongoose> | null = null;
let groupIndexCleanupPromise: Promise<void> | null = null;

async function cleanupLegacyGroupIndexes(): Promise<void> {
  if (groupIndexCleanupPromise) return groupIndexCleanupPromise;

  groupIndexCleanupPromise = (async () => {
    const collection = mongoose.connection.db?.collection("groups");
    if (!collection) return;
    const indexes = await collection.indexes();
    const legacyIndex = indexes.find((index) => index.name === "groupCode_1");
    if (legacyIndex) {
      await collection.dropIndex("groupCode_1");
      logger.info("Dropped legacy groupCode_1 index");
    }
  })().catch((err) => {
    groupIndexCleanupPromise = null;
    logger.error({ err }, "Failed to clean up legacy group indexes");
  });

  return groupIndexCleanupPromise;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectingPromise) return connectingPromise;

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    const error = new Error("MongoDB is not configured for this project");
    (error as Error & { statusCode?: number }).statusCode = 503;
    throw error;
  }

  connectingPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then((m) => {
      logger.info("MongoDB connected");
      void cleanupLegacyGroupIndexes();
      return m;
    })
    .catch((err) => {
      connectingPromise = null;
      logger.error({ err }, "MongoDB connection failed");
      throw err;
    });

  return connectingPromise;
}
