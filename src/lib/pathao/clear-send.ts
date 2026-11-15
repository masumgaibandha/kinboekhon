import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";

// A send still "sending" after this long was cut off and counts as unknown.
export const STUCK_SEND_MS = 2 * 60 * 1000;

export function sendIsUnclear(courier: { state: string; startedAt: Date } | undefined, now = Date.now()): boolean {
  if (!courier) return false;
  return courier.state === "unknown" || (courier.state === "sending" && now - courier.startedAt.getTime() > STUCK_SEND_MS);
}

// After the admin checked the Pathao panel and the parcel is not there, the order can be sent again.
export async function clearUnclearSend(orderNumber: string): Promise<AdminActionResult> {
  await connectMongoose();
  const stuckBefore = new Date(Date.now() - STUCK_SEND_MS);
  const cleared = await OrderModel.findOneAndUpdate(
    {
      orderNumber,
      $or: [{ "courier.state": "unknown" }, { "courier.state": "sending", "courier.startedAt": { $lt: stuckBefore } }],
    },
    {
      $unset: { courier: "" },
      $push: { statusHistory: { kind: "courier", status: "confirmed", at: new Date(), note: "Pathao send cleared: not found in the Pathao panel." } },
    },
    { projection: { status: 1 } },
  ).lean();
  if (!cleared) return adminFail("This order has no unclear Pathao send. Reload the page.");
  return { ok: true, message: "Cleared. You can send the order again." };
}
