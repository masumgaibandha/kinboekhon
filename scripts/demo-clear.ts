import { connectMongoose, DB_NAME, isProductionDb, mongoClient } from "@/lib/db";

import { deleteDemoImages } from "./demo-cloudinary";
import { deleteDemoRecords } from "./demo-records";

// Deletes every record marked isDemo and the demo images on Cloudinary. Only on a dev database.
async function clearDemo() {
  if (isProductionDb) throw new Error("MONGODB_URI points to the production database. Demo scripts run only on dev.");
  await connectMongoose();

  console.log(`Database: ${DB_NAME}`);
  console.log(await deleteDemoRecords());
  console.log(`Deleted ${await deleteDemoImages()} demo images on Cloudinary.`);
}

clearDemo()
  .catch((error: unknown) => {
    console.error(`Demo clear failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
