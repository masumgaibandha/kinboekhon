import { z } from "zod";

import { connectMongoose } from "@/lib/db";
import type { OrderLocation } from "@/lib/locations/types";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { ORDER_NUMBER_PATTERN } from "@/lib/orders/admin-order-detail";
import { amountToCollect } from "@/lib/pathao/parcel";

export const MAX_INVOICES = 100;

export const invoiceListSchema = z.array(z.string().regex(ORDER_NUMBER_PATTERN)).min(1).max(MAX_INVOICES);

export interface InvoiceOrder {
  orderNumber: string;
  date: string;
  name: string;
  phone: string;
  address: string;
  place: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paidInAdvance: number;
  toCollect: number;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric" });

// Bangla place line: city corporation or upazila, then district.
function placeLine(location: OrderLocation): string {
  if (location.kind === "dhaka_city") return `${location.cityCorporationName}, ${location.district}`;
  return `${location.upazila}, ${location.district}`;
}

function toInvoice(order: OrderDocument): InvoiceOrder {
  const toCollect = amountToCollect(order);
  return {
    orderNumber: order.orderNumber,
    date: dateFormat.format(order.createdAt),
    name: order.customer.name,
    phone: order.customer.phone,
    address: order.customer.address,
    place: placeLine(order.customer.location),
    productName: order.product.name,
    quantity: order.quantity,
    price: order.product.price,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge ?? 0,
    discount: order.discount,
    total: order.total,
    paidInAdvance: order.total - toCollect,
    toCollect,
  };
}

// The orders in the order they were asked for; unknown numbers are left out.
export async function getInvoiceOrders(orderNumbers: string[]): Promise<InvoiceOrder[]> {
  await connectMongoose();
  const docs = await OrderModel.find({ orderNumber: { $in: orderNumbers } }, { statusHistory: 0, tracking: 0 }).lean<OrderDocument[]>();
  const byNumber = new Map(docs.map((doc) => [doc.orderNumber, doc]));
  return [...new Set(orderNumbers)].flatMap((number) => {
    const doc = byNumber.get(number);
    return doc ? [toInvoice(doc)] : [];
  });
}
