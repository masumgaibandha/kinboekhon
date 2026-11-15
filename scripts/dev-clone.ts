import mongoose from "mongoose";

import { dbNameFromUri, PRODUCTION_DB_NAME } from "@/lib/db";
import { requiredEnv } from "@/lib/env";

const COLLECTIONS = ["settings", "products"];

// Copies settings and products from production into the dev database. Production is only read.
async function cloneToDev() {
  const prodUri = requiredEnv("MONGODB_URI_PROD");
  const devUri = requiredEnv("MONGODB_URI");
  const prodDbName = dbNameFromUri(prodUri);
  const devDbName = dbNameFromUri(devUri);
  if (prodDbName !== PRODUCTION_DB_NAME) {
    throw new Error(`MONGODB_URI_PROD must point to "${PRODUCTION_DB_NAME}", not "${prodDbName}".`);
  }
  if (devDbName === PRODUCTION_DB_NAME) {
    throw new Error("MONGODB_URI points to the production database. Point it to kinboekhon_dev first.");
  }

  const prodClient = new mongoose.mongo.MongoClient(prodUri, { readPreference: "secondaryPreferred" });
  const devClient = new mongoose.mongo.MongoClient(devUri);
  try {
    const prodDb = prodClient.db(prodDbName);
    const devDb = devClient.db(devDbName);
    for (const name of COLLECTIONS) {
      const docs = await prodDb.collection(name).find().toArray();
      const indexes = await prodDb.collection(name).indexes();
      const target = devDb.collection(name);
      await target.deleteMany({});
      if (docs.length > 0) await target.insertMany(docs);
      for (const { key, name, unique } of indexes) {
        if (name !== "_id_") await target.createIndex(key, { name, unique: unique === true });
      }
      console.log(`${name}: ${docs.length} copied to ${devDbName}`);
    }
  } finally {
    await Promise.all([prodClient.close(), devClient.close()]);
  }
}

cloneToDev().catch((error: unknown) => {
  console.error(`Clone failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
