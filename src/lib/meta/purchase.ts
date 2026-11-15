import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { sendCapiEvent } from "@/lib/meta/capi";
import { customerUserData } from "@/lib/meta/user-data";
import { OrderModel, type OrderTracking } from "@/lib/models/Order";

interface PurchaseOrder {
  orderNumber: string;
  product: { productId: Types.ObjectId; name: string };
  quantity: number;
  subtotal: number;
  customer: { name: string; phone: string; location: { districtId: string } };
  tracking?: OrderTracking;
  createdAt: Date;
}

export const purchaseEventId = (orderNumber: string) => `purchase_${orderNumber}`;

// Sends the server Purchase for a saved order and records the result on it.
export async function sendPurchaseEvent(publicId: string): Promise<void> {
  await connectMongoose();
  const order = await OrderModel.findOne(
    { publicId },
    { orderNumber: 1, product: 1, quantity: 1, subtotal: 1, customer: 1, tracking: 1, createdAt: 1 },
  ).lean<PurchaseOrder>();
  if (!order) return;

  const tracking = order.tracking ?? {};
  const result = await sendCapiEvent({
    event_name: "Purchase",
    event_id: purchaseEventId(order.orderNumber),
    event_time: Math.floor(order.createdAt.getTime() / 1000),
    event_source_url: tracking.sourceUrl ?? "",
    action_source: "website",
    user_data: customerUserData(
      { name: order.customer.name, phone: order.customer.phone, districtId: order.customer.location.districtId },
      tracking,
    ),
    custom_data: {
      content_ids: [String(order.product.productId)],
      content_name: order.product.name,
      content_type: "product",
      currency: "BDT",
      // Product total only: no delivery charge, no discount.
      value: order.subtotal,
      num_items: order.quantity,
    },
  });

  const capiPurchase = result.ok ? { status: "sent" } : { status: "failed", error: result.error };
  await OrderModel.updateOne({ publicId }, { $set: { capiPurchase } });
}
