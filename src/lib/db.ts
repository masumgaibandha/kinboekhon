import mongoose from "mongoose";

import { requiredEnv } from "@/lib/env";

const DB_NAME = "kinboekhon";

type MongoClient = InstanceType<typeof mongoose.mongo.MongoClient>;

const globalCache = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongooseReady?: Promise<void>;
};

// One client per server instance, shared by Better Auth and Mongoose. Cached on globalThis for dev reloads.
export const mongoClient =
  globalCache.mongoClient ?? new mongoose.mongo.MongoClient(requiredEnv("MONGODB_URI"));

if (process.env.NODE_ENV !== "production") globalCache.mongoClient = mongoClient;

export const mongoDb = mongoClient.db(DB_NAME);

// Register every Mongoose model on this connection, not on the default one.
export const appDb = mongoose.connection.useDb(DB_NAME, { useCache: true });

export async function connectMongoose(): Promise<void> {
  if (appDb.readyState === 1) return;
  globalCache.mongooseReady ??= mongoClient
    .connect()
    .then(() => {
      mongoose.connection.setClient(mongoClient);
    })
    .catch((error: unknown) => {
      globalCache.mongooseReady = undefined;
      throw error;
    });
  await globalCache.mongooseReady;
}
