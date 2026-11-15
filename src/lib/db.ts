import mongoose from "mongoose";

import { requiredEnv } from "@/lib/env";

export const PRODUCTION_DB_NAME = "kinboekhon";

// The database name comes from the URI path (".../kinboekhon_dev"); production URIs have none.
export function dbNameFromUri(uri: string): string {
  const path = /^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/.exec(uri)?.[1];
  return path ? decodeURIComponent(path) : PRODUCTION_DB_NAME;
}

const MONGODB_URI = requiredEnv("MONGODB_URI");

export const DB_NAME = dbNameFromUri(MONGODB_URI);
export const isProductionDb = DB_NAME === PRODUCTION_DB_NAME;

type MongoClient = InstanceType<typeof mongoose.mongo.MongoClient>;

const globalCache = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongooseReady?: Promise<void>;
};

// One client per server instance, shared by Better Auth and Mongoose. Cached on globalThis for dev reloads.
export const mongoClient = globalCache.mongoClient ?? new mongoose.mongo.MongoClient(MONGODB_URI);

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
