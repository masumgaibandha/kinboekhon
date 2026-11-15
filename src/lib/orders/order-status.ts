import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import type { OrderHistoryEntry } from "@/lib/models/order-document";
import type { OrderStatus } from "@/lib/orders/enums";
import { orderItems, type OrderItem } from "@/lib/orders/order-items";
import { PUBLIC_ID_PATTERN } from "@/lib/orders/thank-you";
import { trackingUrl } from "@/lib/pathao/config";
import type { OrderStatusInput } from "@/lib/validation/order-status";

// Only what the tracking page shows: no address, name or payment details.
export interface TrackedOrder {
  orderNumber: string;
  placedAt: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: OrderStatus;
  // When the order last reached each status, as ISO strings.
  reachedAt: Partial<Record<OrderStatus, string>>;
  trackingUrl: string | null;
}

type ItemName = Pick<OrderItem, "name">;

interface StatusDoc {
  orderNumber: string;
  createdAt: Date;
  items?: (ItemName & { quantity: number })[];
  product?: ItemName;
  quantity?: number;
  total: number;
  status: OrderStatus;
  statusHistory: Pick<OrderHistoryEntry, "kind" | "status" | "at">[];
  courier?: { consignmentId?: string };
}

// Both must match, so nobody can look up other people's orders by phone alone.
export async function findOrderStatus({ orderNumber, phone }: OrderStatusInput): Promise<TrackedOrder | null> {
  await connectMongoose();
  const doc = await OrderModel.findOne(
    { orderNumber, "customer.phone": phone },
    {
      orderNumber: 1,
      createdAt: 1,
      "items.name": 1,
      "items.quantity": 1,
      "product.name": 1,
      quantity: 1,
      total: 1,
      status: 1,
      statusHistory: 1,
      "courier.consignmentId": 1,
    },
  ).lean<StatusDoc>();
  if (!doc) return null;

  const reachedAt: TrackedOrder["reachedAt"] = {};
  for (const entry of doc.statusHistory) {
    if (entry.kind === "status") reachedAt[entry.status] = entry.at.toISOString();
  }
  reachedAt.pending ??= doc.createdAt.toISOString();

  return {
    orderNumber: doc.orderNumber,
    placedAt: doc.createdAt.toISOString(),
    items: orderItems(doc).map(({ name, quantity }) => ({ name, quantity })),
    total: doc.total,
    status: doc.status,
    reachedAt,
    trackingUrl: doc.courier?.consignmentId ? trackingUrl(doc.courier.consignmentId) : null,
  };
}

// The thank-you page links here with the order's secret id, so the form starts filled in.
export async function findTrackPrefill(publicId: string): Promise<OrderStatusInput | null> {
  if (!PUBLIC_ID_PATTERN.test(publicId)) return null;
  await connectMongoose();
  const doc = await OrderModel.findOne({ publicId }, { orderNumber: 1, "customer.phone": 1 }).lean<{
    orderNumber: string;
    customer: { phone: string };
  }>();
  return doc ? { orderNumber: doc.orderNumber, phone: doc.customer.phone } : null;
}
