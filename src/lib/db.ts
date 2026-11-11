import mongoose from "mongoose";

import { requiredEnv } from "@/lib/env";

const DB_NAME = "kinboekhon";

type MongoClient = InstanceType<typeof mongoose.mongo.MongoClient>;

const globalCache = globalThis as unknown as { mongoClient?: MongoClient };

// One client per server instance; it connects on first use. Cached on globalThis so dev reloads reuse it.
export const mongoClient =
  globalCache.mongoClient ?? new mongoose.mongo.MongoClient(requiredEnv("MONGODB_URI"));

if (process.env.NODE_ENV !== "production") globalCache.mongoClient = mongoClient;

export const mongoDb = mongoClient.db(DB_NAME);
