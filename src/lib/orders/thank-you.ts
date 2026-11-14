import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import type { PaymentStatus } from "@/lib/orders/enums";

const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{16}$/;

// Only what the thank-you page shows: no address or phone number.
export interface ThankYouOrder {
  orderNumber: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  advanceAmount: number;
  dueOnDelivery: number;
  paymentStatus: PaymentStatus;
}

interface ThankYouDoc {
  orderNumber: string;
  product: { name: string; price: number };
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  payment: { advanceAmount: number; dueOnDelivery: number; status: PaymentStatus };
}

export async function getThankYouOrder(publicId: string): Promise<ThankYouOrder | null> {
  if (!PUBLIC_ID_PATTERN.test(publicId)) return null;
  await connectMongoose();
  const doc = await OrderModel.findOne(
    { publicId },
    {
      orderNumber: 1,
      "product.name": 1,
      "product.price": 1,
      quantity: 1,
      subtotal: 1,
      discount: 1,
      total: 1,
      "payment.advanceAmount": 1,
      "payment.dueOnDelivery": 1,
      "payment.status": 1,
    },
  ).lean<ThankYouDoc>();
  if (!doc) return null;

  return {
    orderNumber: doc.orderNumber,
    productName: doc.product.name,
    price: doc.product.price,
    quantity: doc.quantity,
    subtotal: doc.subtotal,
    discount: doc.discount,
    total: doc.total,
    advanceAmount: doc.payment.advanceAmount,
    dueOnDelivery: doc.payment.dueOnDelivery,
    paymentStatus: doc.payment.status,
  };
}
