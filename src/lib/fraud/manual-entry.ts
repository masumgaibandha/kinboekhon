import { connectMongoose } from "@/lib/db";
import { refreshCustomerRisk } from "@/lib/fraud/customer-risk";
import { DeliveryCheckModel } from "@/lib/models/DeliveryCheck";
import type { ManualHistory } from "@/lib/validation/delivery-history";

// One manual entry per phone; a new one replaces it. Never changes an order.
export async function saveManualHistory(phone: string, entry: Omit<ManualHistory, "orderNumber">): Promise<void> {
  await connectMongoose();
  const total = entry.delivered !== null && entry.failed !== null ? entry.delivered + entry.failed : null;
  await DeliveryCheckModel.updateOne(
    { phone, source: "manual" },
    {
      $set: {
        status: "found",
        delivered: entry.delivered,
        failed: entry.failed,
        total,
        pathaoRating: entry.pathaoRating,
        note: entry.note,
        checkedAt: new Date(),
        error: "",
        errorAt: null,
      },
    },
    { upsert: true },
  );
  await refreshCustomerRisk(phone);
}
