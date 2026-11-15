import { syncCustomer } from "@/lib/customers/sync-customer";
import { connectMongoose, mongoClient } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";

// Creates or refreshes one customer record per phone found on existing orders. Safe to run again.
async function backfillCustomers() {
  await connectMongoose();
  const phones: unknown[] = await OrderModel.distinct("customer.phone");
  for (const phone of phones) if (typeof phone === "string") await syncCustomer(phone);
  console.log(`Customers synced: ${phones.length}`);
}

backfillCustomers()
  .catch((error: unknown) => {
    console.error(`Backfill failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
