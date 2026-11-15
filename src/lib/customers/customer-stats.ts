import type { OrderStatus } from "@/lib/orders/enums";

export interface CustomerStats {
  orders: number;
  delivered: number;
  cancelled: number;
  returned: number;
  // Sum of the totals of delivered orders.
  spent: number;
}

export function customerStats(orders: { status: OrderStatus; total: number }[]): CustomerStats {
  const count = (status: OrderStatus) => orders.filter((order) => order.status === status).length;
  return {
    orders: orders.length,
    delivered: count("delivered"),
    cancelled: count("cancelled"),
    returned: count("returned"),
    spent: orders.reduce((sum, order) => sum + (order.status === "delivered" ? order.total : 0), 0),
  };
}

// Returned out of delivered plus returned, as "25%", or "-" with nothing finished yet.
export function returnRate(stats: Pick<CustomerStats, "delivered" | "returned">): string {
  const finished = stats.delivered + stats.returned;
  return finished === 0 ? "-" : `${Math.round((stats.returned / finished) * 100)}%`;
}

const statusCount = (status: OrderStatus) => ({
  $size: { $filter: { input: "$orders", cond: { $eq: ["$$this.status", status] } } },
});

// The same numbers as customerStats, as aggregation fields over an "orders" array of { status, total }.
export const STATS_FIELDS = {
  orderCount: { $size: "$orders" },
  delivered: statusCount("delivered"),
  cancelled: statusCount("cancelled"),
  returned: statusCount("returned"),
  spent: {
    $sum: {
      $map: {
        input: { $filter: { input: "$orders", cond: { $eq: ["$$this.status", "delivered"] } } },
        in: "$$this.total",
      },
    },
  },
};
