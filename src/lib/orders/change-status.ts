import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { STATUS_LABELS } from "@/lib/orders/status";
import type { StatusChange } from "@/lib/validation/admin-order";

export const ORDER_CHANGED = "This order was changed since you opened it. Reload the page.";
export const ORDER_NOT_FOUND = "Order not found.";

// After a failed guarded update: the order is gone, or someone changed it first.
export async function missOrStale(orderNumber: string): Promise<AdminActionResult> {
  const exists = await OrderModel.exists({ orderNumber });
  return adminFail(exists ? ORDER_CHANGED : ORDER_NOT_FOUND);
}

// Moves the order only if it still has the status the admin saw, so two tabs cannot skip a step.
export async function changeOrderStatus({ orderNumber, from, to, note }: StatusChange): Promise<AdminActionResult> {
  await connectMongoose();
  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, status: from },
    { $set: { status: to }, $push: { statusHistory: { kind: "status", status: to, at: new Date(), note } } },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(orderNumber);
  return { ok: true, message: `Status changed to ${STATUS_LABELS[to]}.` };
}

// Writes the note only if nobody changed it since the form was loaded.
export async function saveOrderNote(orderNumber: string, note: string, initial: string): Promise<AdminActionResult> {
  if (note === initial) return adminFail("Nothing changed.");
  await connectMongoose();
  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, adminNote: initial },
    { $set: { adminNote: note } },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(orderNumber);
  return { ok: true, message: "Note saved." };
}
