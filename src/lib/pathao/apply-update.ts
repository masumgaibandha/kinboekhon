import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { canMoveStatus } from "@/lib/orders/status";
import { courierStatusLabel, orderStatusFor } from "@/lib/pathao/status-map";
import { queueStatusSms } from "@/lib/sms/order-sms";
import { syncReturnedStock } from "@/lib/stock/order-stock";

export interface PathaoUpdate {
  consignmentId: string;
  slug: string;
  at: Date;
  deliveryFee?: number;
  reason?: string;
}

export type UpdateResult = "applied" | "same" | "older" | "not_found";

type CourierOrder = Pick<OrderDocument, "orderNumber" | "status" | "courier">;

// Saves a Pathao status on its order with a history entry, and moves the order when the parcel is delivered or returned.
// The write matches the status and courier time it read, so two updates at once cannot overwrite each other.
export async function applyPathaoUpdate(update: PathaoUpdate, attempt = 0): Promise<UpdateResult> {
  await connectMongoose();
  const order = await OrderModel.findOne(
    { "courier.consignmentId": update.consignmentId },
    { orderNumber: 1, status: 1, courier: 1 },
  ).lean<CourierOrder>();
  if (!order?.courier) return "not_found";
  const { courier } = order;
  const fee = update.deliveryFee !== undefined && Number.isFinite(update.deliveryFee) ? Math.round(update.deliveryFee) : undefined;
  const feeChanged = fee !== undefined && fee !== courier.deliveryFee;
  if (courier.statusAt && update.at < courier.statusAt) return "older";
  if (courier.status === update.slug && !feeChanged) return "same";

  const target = orderStatusFor(update.slug);
  const move = target && canMoveStatus(order.status, target) ? target : null;
  const label = courierStatusLabel(update.slug);
  const history = [];
  if (courier.status !== update.slug) {
    history.push({ kind: "courier", status: order.status, at: update.at, note: `Pathao: ${label}${update.reason ? `. ${update.reason}` : ""}` });
  }
  if (move) history.push({ kind: "status", status: move, at: update.at, note: `From Pathao: ${label}.` });

  const result = await OrderModel.updateOne(
    { orderNumber: order.orderNumber, status: order.status, "courier.statusAt": courier.statusAt ?? null },
    {
      $set: {
        "courier.status": update.slug,
        "courier.statusAt": update.at,
        ...(fee !== undefined && { "courier.deliveryFee": fee }),
        ...(move && { status: move }),
      },
      ...(history.length > 0 && { $push: { statusHistory: { $each: history } } }),
    },
  );
  if (result.modifiedCount > 0) {
    if (move === "returned") await syncReturnedStock(order.orderNumber);
    if (move) queueStatusSms(order.orderNumber, move);
    return "applied";
  }
  return attempt < 2 ? applyPathaoUpdate(update, attempt + 1) : "same";
}
