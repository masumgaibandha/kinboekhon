import type { AdminActionResult } from "@/lib/admin-result";
import { adminFail } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { missOrStale } from "@/lib/orders/change-status";
import type { ReturnReason } from "@/lib/orders/enums";
import { RETURN_REASON_LABELS } from "@/lib/orders/return-reason-labels";
import { syncReturnedStock } from "@/lib/stock/order-stock";

export const FAILED_STATUSES = ["cancelled", "returned"] as const;

// Writes only on a cancelled or returned order whose reason is still the one the form was loaded with.
export async function saveReturnReason(
  orderNumber: string,
  reason: ReturnReason | "",
  initial: ReturnReason | "",
): Promise<AdminActionResult> {
  if (reason === initial) return adminFail("Nothing changed.");
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { status: 1 }).lean<{ status: string }>();
  if (!order) return missOrStale(orderNumber);
  const note = reason ? RETURN_REASON_LABELS[reason] : "Cleared";
  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, status: { $in: FAILED_STATUSES }, returnReason: initial || null },
    {
      ...(reason ? { $set: { returnReason: reason } } : { $unset: { returnReason: 1 } }),
      $push: { statusHistory: { kind: "return_reason", status: order.status, at: new Date(), note } },
    },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(orderNumber);
  await syncReturnedStock(orderNumber);
  return { ok: true, message: reason ? "Return reason saved." : "Return reason cleared." };
}
