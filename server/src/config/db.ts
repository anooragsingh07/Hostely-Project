import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

/** Idempotent connect — safe to call once at boot. */
export const connectDatabase = async (): Promise<void> => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info("MongoDB connected");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
