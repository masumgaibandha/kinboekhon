import mongoose, { type Model, type Schema } from "mongoose";

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

const globalCache = globalThis as unknown as { mongoClient?: MongoClient };

// One long-lived client per server process, shared by Better Auth and Mongoose in every bundle. Runtime code never closes it.
export const mongoClient = (globalCache.mongoClient ??= new mongoose.mongo.MongoClient(MONGODB_URI));

export const mongoDb = mongoClient.db(DB_NAME);

// Register every Mongoose model on this connection, not on the default one.
export const appDb = mongoose.connection.useDb(DB_NAME, { useCache: true });

// Every server bundle runs the model files again. Production reuses the first model, so all bundles share one
// collection that opens with the connection; development replaces it so schema edits apply after a hot reload.
export function registerModel<T>(name: string, schema: Schema<T>, collection?: string): Model<T> {
  const existing = appDb.models[name] as Model<T> | undefined;
  if (existing && process.env.NODE_ENV === "production") return existing;
  if (existing) appDb.deleteModel(name);
  return appDb.model<T>(name, schema, collection);
}

// A failed connect leaves the client on a closed topology that never reopens by itself.
// connect() opens a new one in that case and returns at once while connected, so call this before every use.
export async function connectMongoose(): Promise<void> {
  await mongoClient.connect();
  if (mongoose.connection.getClient() !== mongoClient) mongoose.connection.setClient(mongoClient);
}
