import { DB_NAME, isProductionDb, mongoClient } from "@/lib/db";
import { requiredEnv } from "@/lib/env";

import { upsertAdmin } from "./admin-account";

async function seedAdmin() {
  if (!isProductionDb) {
    throw new Error(
      `MONGODB_URI points to "${DB_NAME}". The real admin lives only in production: set MONGODB_URI to the production URI for this one command, or use npm run seed:dev-admin.`,
    );
  }
  const email = requiredEnv("ADMIN_EMAIL").trim().toLowerCase();
  await upsertAdmin(email, requiredEnv("ADMIN_PASSWORD"), "ADMIN_PASSWORD");
}

seedAdmin()
  .catch((error: unknown) => {
    console.error(`Seed failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
