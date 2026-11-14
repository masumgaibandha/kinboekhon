import type { AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument, type OrderHistoryEntry } from "@/lib/models/Order";
import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import { missOrStale } from "@/lib/orders/change-status";
import type { CallOutcome, OrderStatus, PaymentStatus } from "@/lib/orders/enums";
import { STATUS_LABELS, canMoveStatus } from "@/lib/orders/status";

// The status a call moves the order to. No answer and Call later keep it as it is.
const CALL_STATUS: Partial<Record<CallOutcome, OrderStatus>> = {
  agreed_to_wait: "confirmed",
  declined: "cancelled",
};

// Moves only along allowed steps, so a shipped or finished order keeps its status.
// An advance payment waiting for review is confirmed only by approving it.
function statusAfterCall(outcome: CallOutcome, status: OrderStatus, payment: PaymentStatus): OrderStatus | null {
  const target = CALL_STATUS[outcome];
  if (!target || !canMoveStatus(status, target)) return null;
  if (target === "confirmed" && payment === "submitted") return null;
  return target;
}

// Every call is kept in the history; lastCall holds the newest one for the orders list.
export async function logOrderCall(orderNumber: string, outcome: CallOutcome, note: string): Promise<AdminActionResult> {
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { status: 1, "payment.status": 1 }).lean<
    Pick<OrderDocument, "status"> & { payment: Pick<OrderDocument["payment"], "status"> }
  >();
  if (!order) return missOrStale(orderNumber);

  const label = CALL_OUTCOME_LABELS[outcome];
  const next = statusAfterCall(outcome, order.status, order.payment.status);
  const at = new Date();
  const history: OrderHistoryEntry[] = [{ kind: "call", status: order.status, outcome, at, note }];
  if (next) history.push({ kind: "status", status: next, at, note: `After call: ${label}` });

  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, status: order.status, "payment.status": order.payment.status },
    {
      $set: { lastCall: { outcome, at, note }, ...(next && { status: next }) },
      $push: { statusHistory: { $each: history } },
    },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(orderNumber);

  if (next) return { ok: true, message: `Call saved: ${label}. Status changed to ${STATUS_LABELS[next]}.` };
  if (outcome === "agreed_to_wait" && order.status === "pending" && order.payment.status === "submitted") {
    return { ok: true, warning: true, message: `Call saved: ${label}. Approve the advance payment to confirm the order.` };
  }
  return { ok: true, message: `Call saved: ${label}.` };
}
