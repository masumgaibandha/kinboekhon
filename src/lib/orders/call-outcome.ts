import type { AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import { missOrStale } from "@/lib/orders/change-status";
import type { CallOutcome } from "@/lib/orders/enums";

// Every call is kept in the history; lastCall holds the newest one for the orders list.
export async function logOrderCall(orderNumber: string, outcome: CallOutcome, note: string): Promise<AdminActionResult> {
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { status: 1 }).lean();
  if (!order) return missOrStale(orderNumber);
  const call = { outcome, at: new Date(), note };
  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, status: order.status },
    { $set: { lastCall: call }, $push: { statusHistory: { kind: "call", status: order.status, ...call } } },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(orderNumber);
  return { ok: true, message: `Call saved: ${CALL_OUTCOME_LABELS[outcome]}.` };
}
