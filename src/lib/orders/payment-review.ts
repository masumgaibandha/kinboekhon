import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { ORDER_NOT_FOUND, missOrStale } from "@/lib/orders/change-status";
import type { OrderStatus, PaymentOption, PaymentStatus } from "@/lib/orders/enums";
import { calculateOrder } from "@/lib/orders/pricing";
import { STATUS_LABELS } from "@/lib/orders/status";

export const ALREADY_REVIEWED = "Already reviewed.";

interface ReviewDoc {
  status: OrderStatus;
  quantity: number;
  deliveryCharge: number;
  total: number;
  product: { price: number };
  payment: { option: PaymentOption; status: PaymentStatus };
}

const money = (amount: number) => amount.toLocaleString("en-IN");
const withNote = (text: string, note: string) => (note ? `${text}: ${note}` : text);

async function loadForReview(orderNumber: string) {
  await connectMongoose();
  return OrderModel.findOne(
    { orderNumber },
    { status: 1, quantity: 1, deliveryCharge: 1, total: 1, "product.price": 1, "payment.option": 1, "payment.status": 1 },
  ).lean<ReviewDoc>();
}

// After a missed guarded update: the payment was reviewed in another tab, or the order changed.
async function reviewMiss(orderNumber: string): Promise<AdminActionResult> {
  const order = await OrderModel.findOne({ orderNumber }, { "payment.status": 1 }).lean<Pick<ReviewDoc, "payment">>();
  if (order && order.payment.status !== "submitted") return adminFail(ALREADY_REVIEWED);
  return missOrStale(orderNumber);
}

// Verifies the payment; a pending order also becomes confirmed. Both happen in one guarded update.
export async function approvePayment(orderNumber: string, note: string): Promise<AdminActionResult> {
  const order = await loadForReview(orderNumber);
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (order.payment.status !== "submitted") return adminFail(ALREADY_REVIEWED);

  const at = new Date();
  const confirm = order.status === "pending";
  const history = [{ kind: "payment", status: order.status, at, note: withNote("Payment approved", note) }];
  if (confirm) history.push({ kind: "status", status: "confirmed", at, note: "Advance payment approved" });

  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, status: order.status, "payment.status": "submitted" },
    {
      $set: {
        "payment.status": "verified",
        "payment.reviewNote": note,
        "payment.reviewedAt": at,
        ...(confirm && { status: "confirmed" }),
      },
      $push: { statusHistory: { $each: history } },
    },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return reviewMiss(orderNumber);
  if (confirm) return { ok: true, message: "Payment approved. The order is now Confirmed." };
  return {
    ok: true,
    warning: true,
    message: `Payment approved. The order is ${STATUS_LABELS[order.status]}, so its status was not changed.`,
  };
}

// Marks the payment rejected; the order keeps its status so the owner can call the customer.
export async function rejectPayment(orderNumber: string, note: string): Promise<AdminActionResult> {
  const order = await loadForReview(orderNumber);
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (order.payment.status !== "submitted") return adminFail(ALREADY_REVIEWED);

  const at = new Date();
  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, status: order.status, "payment.status": "submitted" },
    {
      $set: { "payment.status": "rejected", "payment.reviewNote": note, "payment.reviewedAt": at },
      $push: { statusHistory: { kind: "payment", status: order.status, at, note: withNote("Payment rejected", note) } },
    },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return reviewMiss(orderNumber);
  return { ok: true, message: "Payment rejected. The order stays as it is." };
}

// After a rejected payment: the order becomes cash on delivery at the full price, with nothing paid in advance.
export async function switchToCashOnDelivery(orderNumber: string, note: string): Promise<AdminActionResult> {
  const order = await loadForReview(orderNumber);
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (order.payment.status !== "rejected" || order.payment.option === "cod") {
    return adminFail("Only an order with a rejected advance payment can be switched to cash on delivery.");
  }

  // The delivery charge stays as it was at order time; only the advance discount is removed.
  const amounts = calculateOrder(order.product.price, order.quantity, order.deliveryCharge, "cod");
  const text = `Switched to cash on delivery, total ${money(order.total)} to ${money(amounts.total)}`;
  const updated = await OrderModel.findOneAndUpdate(
    { orderNumber, "payment.status": "rejected", "payment.option": order.payment.option },
    {
      $set: {
        deliveryDiscount: amounts.deliveryDiscount,
        total: amounts.total,
        "payment.option": "cod",
        "payment.method": "cod",
        "payment.status": "cod",
        "payment.advanceAmount": amounts.advanceAmount,
        "payment.dueOnDelivery": amounts.dueOnDelivery,
      },
      $push: { statusHistory: { kind: "payment", status: order.status, at: new Date(), note: withNote(text, note) } },
    },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(orderNumber);
  return { ok: true, message: `Switched to cash on delivery. New total ${money(amounts.total)} taka.` };
}
