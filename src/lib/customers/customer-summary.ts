import { customerStats, type CustomerStats } from "@/lib/customers/customer-stats";
import { sortedTags, type CustomerTag } from "@/lib/customers/tags";
import { connectMongoose } from "@/lib/db";
import { CustomerModel } from "@/lib/models/Customer";
import { OrderModel } from "@/lib/models/Order";
import type { OrderStatus } from "@/lib/orders/enums";

export interface CustomerSummary {
  phone: string;
  // Orders of this phone other than the one being viewed.
  pastOrders: number;
  stats: CustomerStats;
  tags: CustomerTag[];
  hasRecord: boolean;
}

// The small customer card on an order page.
export async function getCustomerSummary(phone: string, orderNumber: string): Promise<CustomerSummary> {
  await connectMongoose();
  const [customer, orders] = await Promise.all([
    CustomerModel.findOne({ phone }, { tags: 1 }).lean<{ tags?: string[] }>(),
    OrderModel.find({ "customer.phone": phone }, { _id: 0, orderNumber: 1, status: 1, total: 1 }).lean<
      { orderNumber: string; status: OrderStatus; total: number }[]
    >(),
  ]);
  return {
    phone,
    pastOrders: orders.filter((order) => order.orderNumber !== orderNumber).length,
    stats: customerStats(orders),
    tags: sortedTags(customer?.tags ?? []),
    hasRecord: customer !== null,
  };
}
