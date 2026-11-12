import { connectMongoose } from "@/lib/db";
import { dhakaDayEnd, dhakaDayStart } from "@/lib/dates";
import { shortLocation } from "@/lib/locations/format";
import type { OrderLocation } from "@/lib/locations/types";
import { OrderModel } from "@/lib/models/Order";
import type { OrderStatus } from "@/lib/orders/enums";
import { normalizePhone } from "@/lib/phone";
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
}

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
  product: { name: string };
  quantity: number;
  total: number;
  status: OrderStatus;
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "KE10001" or "10001" finds an order number, a number starting with 0 finds phones by prefix, anything else a name.
function searchQuery(q: string): Record<string, unknown> {
  const compact = normalizePhone(q);
  if (/^0\d{1,10}$/.test(compact)) return { "customer.phone": { $regex: `^${compact}` } };
  const orderNumber = /^(?:KE)?([1-9]\d{4,8})$/i.exec(compact);
  if (orderNumber) return { orderNumber: `KE${orderNumber[1]}` };
  return { "customer.name": { $regex: escapeRegex(q), $options: "i" } };
}

function buildQuery(filters: OrderFilters): Record<string, unknown> {
  const query: Record<string, unknown> = filters.q ? searchQuery(filters.q) : {};
  if (filters.status) query.status = filters.status;
  if (filters.product) query["product.productId"] = filters.product;

  const from = filters.from ? dhakaDayStart(filters.from) : null;
  const to = filters.to ? dhakaDayEnd(filters.to) : null;
  if (from || to) query.createdAt = { ...(from && { $gte: from }), ...(to && { $lt: to }) };
  return query;
}

export async function listOrdersForAdmin(filters: OrderFilters): Promise<OrderListPage> {
  await connectMongoose();
  const query = buildQuery(filters);
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
    quantity: 1,
    total: 1,
    status: 1,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * ORDERS_PER_PAGE)
    .limit(ORDERS_PER_PAGE)
    .lean<ListDoc[]>();

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
  }));
  return { items, total, page, pageCount };
}
