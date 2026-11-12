import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import type { OrderStatus, PaymentMethod, PaymentOption } from "@/lib/orders/enums";

export interface QueuedPayment {
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  name: string;
  phone: string;
  productName: string;
  quantity: number;
  total: number;
  option: PaymentOption;
  method: PaymentMethod;
  advanceAmount: number;
  senderNumber: string;
  transactionId: string;
}

interface QueueDoc {
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  customer: { name: string; phone: string };
  product: { name: string };
  quantity: number;
  total: number;
  payment: {
    option: PaymentOption;
    method: PaymentMethod;
    advanceAmount: number;
    senderNumber?: string;
    transactionIdNormalized?: string;
  };
}

// Advance payments waiting for review, oldest first.
export async function listPaymentsToReview(): Promise<QueuedPayment[]> {
  await connectMongoose();
  const docs = await OrderModel.find(
    { "payment.status": "submitted" },
    {
      orderNumber: 1,
      createdAt: 1,
      status: 1,
      "customer.name": 1,
      "customer.phone": 1,
      "product.name": 1,
      quantity: 1,
      total: 1,
      "payment.option": 1,
      "payment.method": 1,
      "payment.advanceAmount": 1,
      "payment.senderNumber": 1,
      "payment.transactionIdNormalized": 1,
    },
  )
    .sort({ createdAt: 1 })
    .limit(200)
    .lean<QueueDoc[]>();

  return docs.map((doc) => ({
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    status: doc.status,
    name: doc.customer.name,
    phone: doc.customer.phone,
    productName: doc.product.name,
    quantity: doc.quantity,
    total: doc.total,
    option: doc.payment.option,
    method: doc.payment.method,
    advanceAmount: doc.payment.advanceAmount,
    senderNumber: doc.payment.senderNumber ?? "",
    // The normalized form (uppercase, no spaces) is what the statement shows.
    transactionId: doc.payment.transactionIdNormalized ?? "",
  }));
}
