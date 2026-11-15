import { DB_NAME, isProductionDb, mongoClient } from "@/lib/db";
import { requiredEnv } from "@/lib/env";

import { upsertAdmin } from "./admin-account";

// The dev admin exists only in a dev database, never in production.
async function seedDevAdmin() {
  if (isProductionDb) {
    throw new Error("MONGODB_URI points to the production database. The dev admin is never created there.");
  }
  const email = requiredEnv("DEV_ADMIN_EMAIL").trim().toLowerCase();
  if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
    throw new Error("DEV_ADMIN_EMAIL must differ from ADMIN_EMAIL.");
  }
  await upsertAdmin(email, requiredEnv("DEV_ADMIN_PASSWORD"), "DEV_ADMIN_PASSWORD");
  console.log(`Database: ${DB_NAME}`);
}

seedDevAdmin()
  .catch((error: unknown) => {
    console.error(`Seed failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
