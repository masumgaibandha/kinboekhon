import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import type { RiskLabel } from "@/lib/fraud/risk";
import { shortLocation } from "@/lib/locations/format";
import type { OrderLocation } from "@/lib/locations/types";
import { CustomerModel } from "@/lib/models/Customer";
import { OrderModel, type OrderCall } from "@/lib/models/Order";
import type { OrderStatus } from "@/lib/orders/enums";
import { orderListQuery } from "@/lib/orders/order-query";
import { getProductStocks } from "@/lib/stock/stock-alerts";
import { ORDERS_PER_PAGE, type OrderFilters } from "@/lib/validation/order-filters";

export interface OrderListItem {
  orderNumber: string;
  createdAt: Date;
  name: string;
  phone: string;
  productName: string;
  quantity: number;
  area: string;
  total: number;
  status: OrderStatus;
  lastCall: OrderCall | null;
  customerBlocked: boolean;
  // Null until the phone has a delivery history check or manual entry.
  risk: RiskLabel | null;
  // Confirmed and not sent to Pathao yet.
  canSendToPathao: boolean;
  // Not sent to the courier yet while its product has no stock.
  outOfStock: boolean;
}

// Orders that still need stock when they are sent to the courier.
export const NOT_SENT: OrderStatus[] = ["pending", "confirmed"];

export interface OrderListPage {
  items: OrderListItem[];
  total: number;
  page: number;
  pageCount: number;
}

interface ListDoc {
  orderNumber: string;
  createdAt: Date;
  customer: { name: string; phone: string; location: OrderLocation };
  product: { name: string; productId: Types.ObjectId };
  quantity: number;
  total: number;
  status: OrderStatus;
  lastCall?: OrderCall;
  customerBlocked?: boolean;
  courier?: { state: string };
}

export async function listOrdersForAdmin(filters: OrderFilters): Promise<OrderListPage> {
  await connectMongoose();
  const query = await orderListQuery(filters);
  const total = await OrderModel.countDocuments(query);
  const pageCount = Math.max(1, Math.ceil(total / ORDERS_PER_PAGE));
  const page = Math.min(filters.page, pageCount);

  const docs = await OrderModel.find(query, {
    orderNumber: 1,
    createdAt: 1,
    "customer.name": 1,
    "customer.phone": 1,
    "customer.location": 1,
    "product.name": 1,
    "product.productId": 1,
    quantity: 1,
    total: 1,
    status: 1,
    lastCall: 1,
    customerBlocked: 1,
    "courier.state": 1,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * ORDERS_PER_PAGE)
    .limit(ORDERS_PER_PAGE)
    .lean<ListDoc[]>();

  const risks = await CustomerModel.find(
    { phone: { $in: [...new Set(docs.map((doc) => doc.customer.phone))] }, "risk.label": { $exists: true } },
    { _id: 0, phone: 1, "risk.label": 1 },
  ).lean<{ phone: string; risk: { label: RiskLabel } }[]>();
  const riskByPhone = new Map(risks.map((customer) => [customer.phone, customer.risk.label]));
  const stocks = await getProductStocks([...new Set(docs.map((doc) => String(doc.product.productId)))]);

  const items = docs.map((doc) => ({
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    name: doc.customer.name,
    phone: doc.customer.phone,
    productName: doc.product.name,
    quantity: doc.quantity,
    area: shortLocation(doc.customer.location),
    total: doc.total,
    status: doc.status,
    lastCall: doc.lastCall?.outcome ? { outcome: doc.lastCall.outcome, at: doc.lastCall.at, note: doc.lastCall.note ?? "" } : null,
    customerBlocked: doc.customerBlocked === true,
    risk: riskByPhone.get(doc.customer.phone) ?? null,
    canSendToPathao: doc.status === "confirmed" && !doc.courier,
    outOfStock: NOT_SENT.includes(doc.status) && (stocks.get(String(doc.product.productId))?.stock ?? 0) <= 0,
  }));
  return { items, total, page, pageCount };
}
