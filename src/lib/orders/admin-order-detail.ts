import { connectMongoose } from "@/lib/db";
import type { OrderLocation } from "@/lib/locations/types";
import { OrderModel, type OrderDocument, type OrderHistoryEntry } from "@/lib/models/Order";
import type { OrderStatus, PaymentOption } from "@/lib/orders/enums";
import type { DeliveryArea } from "@/lib/orders/limits";

export const ORDER_NUMBER_PATTERN = /^KE\d{5,9}$/;

export interface AdminOrder {
  orderNumber: string;
  createdAt: Date;
  // Changes on every save; edit forms are keyed on it.
  version: string;
  status: OrderStatus;
  product: { name: string; slug: string; price: number };
  quantity: number;
  subtotal: number;
  deliveryArea: DeliveryArea;
  deliveryCharge: number;
  deliveryDiscount: number;
  total: number;
  paymentOption: PaymentOption;
  advanceAmount: number;
  dueOnDelivery: number;
  customer: { name: string; phone: string; address: string; location: OrderLocation };
  history: OrderHistoryEntry[];
  adminNote: string;
}

export async function getOrderForAdmin(orderNumber: string): Promise<AdminOrder | null> {
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) return null;
  await connectMongoose();
  const doc = await OrderModel.findOne({ orderNumber }, { publicId: 0, tracking: 0, capiPurchase: 0 }).lean<OrderDocument>();
  if (!doc) return null;

  return {
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    version: doc.updatedAt.toISOString(),
    status: doc.status,
    product: { name: doc.product.name, slug: doc.product.slug, price: doc.product.price },
    quantity: doc.quantity,
    subtotal: doc.subtotal,
    deliveryArea: doc.deliveryArea,
    deliveryCharge: doc.deliveryCharge,
    deliveryDiscount: doc.deliveryDiscount,
    total: doc.total,
    paymentOption: doc.payment.option,
    advanceAmount: doc.payment.advanceAmount,
    dueOnDelivery: doc.payment.dueOnDelivery,
    customer: {
      name: doc.customer.name,
      phone: doc.customer.phone,
      address: doc.customer.address,
      location: doc.customer.location,
    },
    history: (doc.statusHistory ?? []).map((entry) => ({
      kind: entry.kind ?? "status",
      status: entry.status,
      at: entry.at,
      note: entry.note ?? "",
    })),
    adminNote: doc.adminNote ?? "",
  };
}
