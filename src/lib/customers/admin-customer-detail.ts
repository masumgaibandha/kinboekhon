import { customerStats, type CustomerStats } from "@/lib/customers/customer-stats";
import { sortedTags, type CustomerTag } from "@/lib/customers/tags";
import { connectMongoose } from "@/lib/db";
import { CustomerModel, type CustomerDocument, type CustomerNote } from "@/lib/models/Customer";
import { OrderModel, type OrderHistoryEntry } from "@/lib/models/Order";
import type { CallOutcome, OrderStatus } from "@/lib/orders/enums";
import { BD_MOBILE_PATTERN } from "@/lib/phone";

export interface CustomerOrderRow {
  orderNumber: string;
  createdAt: Date;
  productName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  customerBlocked: boolean;
}

export interface CustomerCall {
  orderNumber: string;
  outcome: CallOutcome;
  at: Date;
  note: string;
}

export interface AdminCustomer {
  phone: string;
  name: string;
  district: string;
  lastOrderAt: Date;
  // Changes on every save; edit forms are keyed on it.
  version: string;
  tags: CustomerTag[];
  // Newest first.
  notes: CustomerNote[];
  stats: CustomerStats;
  orders: CustomerOrderRow[];
  calls: CustomerCall[];
}

interface OrderDoc {
  orderNumber: string;
  createdAt: Date;
  product: { name: string };
  quantity: number;
  total: number;
  status: OrderStatus;
  customerBlocked?: boolean;
  statusHistory?: OrderHistoryEntry[];
}

export async function getCustomerForAdmin(phone: string): Promise<AdminCustomer | null> {
  if (!BD_MOBILE_PATTERN.test(phone)) return null;
  await connectMongoose();
  const [customer, docs] = await Promise.all([
    CustomerModel.findOne({ phone }).lean<CustomerDocument>(),
    OrderModel.find(
      { "customer.phone": phone },
      { orderNumber: 1, createdAt: 1, "product.name": 1, quantity: 1, total: 1, status: 1, customerBlocked: 1, statusHistory: 1 },
    )
      .sort({ createdAt: -1 })
      .lean<OrderDoc[]>(),
  ]);
  if (!customer) return null;

  const calls = docs
    .flatMap((doc) =>
      (doc.statusHistory ?? [])
        .filter((entry) => entry.kind === "call" && entry.outcome)
        .map((entry) => ({ orderNumber: doc.orderNumber, outcome: entry.outcome as CallOutcome, at: entry.at, note: entry.note ?? "" })),
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    phone: customer.phone,
    name: customer.name,
    district: customer.district,
    lastOrderAt: customer.lastOrderAt,
    version: customer.updatedAt.toISOString(),
    tags: sortedTags(customer.tags ?? []),
    notes: [...(customer.notes ?? [])].reverse(),
    stats: customerStats(docs),
    orders: docs.map((doc) => ({
      orderNumber: doc.orderNumber,
      createdAt: doc.createdAt,
      productName: doc.product.name,
      quantity: doc.quantity,
      total: doc.total,
      status: doc.status,
      customerBlocked: doc.customerBlocked === true,
    })),
    calls,
  };
}
