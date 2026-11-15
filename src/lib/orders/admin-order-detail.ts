import { connectMongoose } from "@/lib/db";
import type { OrderLocation } from "@/lib/locations/types";
import { OrderModel, type OrderCourier, type OrderDocument, type OrderHistoryEntry } from "@/lib/models/Order";
import type { CourierLocation } from "@/lib/pathao/location-match";
import type { OrderStatus, PaymentMethod, PaymentOption, PaymentStatus, ReturnReason } from "@/lib/orders/enums";
import type { TurnstileResult } from "@/lib/turnstile";

export const ORDER_NUMBER_PATTERN = /^KE\d{5,9}$/;

export interface AdminPayment {
  option: PaymentOption;
  method: PaymentMethod;
  status: PaymentStatus;
  advanceAmount: number;
  dueOnDelivery: number;
  senderNumber: string;
  transactionId: string;
  reviewNote: string;
  reviewedAt: Date | null;
}

export interface AdminOrder {
  orderNumber: string;
  createdAt: Date;
  // Changes on every save; edit forms are keyed on it.
  version: string;
  status: OrderStatus;
  product: { name: string; slug: string; price: number };
  quantity: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  payment: AdminPayment;
  customer: { name: string; phone: string; address: string; location: OrderLocation };
  history: OrderHistoryEntry[];
  adminNote: string;
  customerBlocked: boolean;
  returnReason: ReturnReason | "";
  tracking: AdminTracking;
  productId: string;
  courier: OrderCourier | null;
  courierLocation: CourierLocation | null;
}

export interface AdminTracking {
  ipHash: string;
  userAgent: string;
  turnstile: TurnstileResult | null;
  // Other orders from the same address in the 24 hours before this one.
  sameIpOrders: number;
  sourceUrl: string;
  utm: { source: string; medium: string; campaign: string; content: string; term: string };
}

export async function getOrderForAdmin(orderNumber: string): Promise<AdminOrder | null> {
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) return null;
  await connectMongoose();
  const doc = await OrderModel.findOne(
    { orderNumber },
    { publicId: 0, "tracking.ip": 0, "tracking.fbp": 0, "tracking.fbc": 0, capiPurchase: 0 },
  ).lean<OrderDocument>();
  if (!doc) return null;

  const ipHash = doc.tracking?.ipHash ?? "";
  const since = new Date(doc.createdAt.getTime() - 24 * 60 * 60 * 1000);
  const sameIpOrders = ipHash
    ? await OrderModel.countDocuments({ "tracking.ipHash": ipHash, createdAt: { $gte: since, $lte: doc.createdAt }, orderNumber: { $ne: orderNumber } })
    : 0;

  return {
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    version: doc.updatedAt.toISOString(),
    status: doc.status,
    product: { name: doc.product.name, slug: doc.product.slug, price: doc.product.price },
    quantity: doc.quantity,
    subtotal: doc.subtotal,
    deliveryCharge: doc.deliveryCharge ?? 0,
    discount: doc.discount,
    total: doc.total,
    payment: {
      option: doc.payment.option,
      method: doc.payment.method,
      status: doc.payment.status,
      advanceAmount: doc.payment.advanceAmount,
      dueOnDelivery: doc.payment.dueOnDelivery,
      senderNumber: doc.payment.senderNumber ?? "",
      transactionId: doc.payment.transactionIdNormalized ?? "",
      reviewNote: doc.payment.reviewNote ?? "",
      reviewedAt: doc.payment.reviewedAt ?? null,
    },
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
      ...(entry.outcome && { outcome: entry.outcome }),
    })),
    adminNote: doc.adminNote ?? "",
    customerBlocked: doc.customerBlocked === true,
    returnReason: doc.returnReason ?? "",
    productId: String(doc.product.productId),
    courier: doc.courier ?? null,
    courierLocation: doc.courierLocation ?? null,
    tracking: {
      ipHash,
      userAgent: doc.tracking?.userAgent ?? "",
      turnstile: doc.tracking?.turnstile ?? null,
      sameIpOrders,
      sourceUrl: doc.tracking?.sourceUrl ?? "",
      utm: {
        source: doc.tracking?.utmSource ?? "",
        medium: doc.tracking?.utmMedium ?? "",
        campaign: doc.tracking?.utmCampaign ?? "",
        content: doc.tracking?.utmContent ?? "",
        term: doc.tracking?.utmTerm ?? "",
      },
    },
  };
}
