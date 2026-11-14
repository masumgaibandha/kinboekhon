import { connectMongoose } from "@/lib/db";
import { IncompleteOrderModel } from "@/lib/models/IncompleteOrder";
import { OrderModel } from "@/lib/models/Order";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/enums";

export interface ProductStat {
  productId: string;
  name: string;
  orders: number;
  sales: number;
}

export interface DashboardStats {
  orders: number;
  byStatus: Record<OrderStatus, number>;
  totalSales: number;
  deliveredValue: number;
  returnPercent: number | null;
  cancelPercent: number | null;
  products: ProductStat[];
  incomplete: number;
  paymentsWaiting: number;
}

interface StatusRow {
  _id: OrderStatus;
  count: number;
  value: number;
}

interface ProductRow {
  _id: { toString(): string };
  name: string;
  orders: number;
  sales: number;
}

// Cancelled and returned orders bring in no money, so they are left out of sales.
const NOT_SOLD: OrderStatus[] = ["cancelled", "returned"];
const SOLD_TOTAL = { $cond: [{ $in: ["$status", NOT_SOLD] }, 0, "$total"] };

const percent = (part: number, whole: number) => (whole === 0 ? null : Math.round((part / whole) * 1000) / 10);

// Stats for orders placed since `start` (all orders when null); draft and payment counts are always live.
export async function getDashboardStats(start: Date | null): Promise<DashboardStats> {
  await connectMongoose();
  const match = start ? { createdAt: { $gte: start } } : {};

  const [facets, incomplete, paymentsWaiting] = await Promise.all([
    OrderModel.aggregate<{ statuses: StatusRow[]; products: ProductRow[] }>([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          statuses: [{ $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$total" } } }],
          products: [
            {
              $group: {
                _id: "$product.productId",
                name: { $first: "$product.name" },
                orders: { $sum: 1 },
                sales: { $sum: SOLD_TOTAL },
              },
            },
            { $sort: { orders: -1, sales: -1 } },
          ],
        },
      },
    ]),
    IncompleteOrderModel.estimatedDocumentCount(),
    OrderModel.countDocuments({ "payment.status": "submitted" }),
  ]);

  const { statuses, products } = facets[0] ?? { statuses: [], products: [] };
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>;
  let orders = 0;
  let totalSales = 0;
  let deliveredValue = 0;
  for (const row of statuses) {
    byStatus[row._id] = row.count;
    orders += row.count;
    if (!NOT_SOLD.includes(row._id)) totalSales += row.value;
    if (row._id === "delivered") deliveredValue = row.value;
  }

  return {
    orders,
    byStatus,
    totalSales,
    deliveredValue,
    returnPercent: percent(byStatus.returned, byStatus.delivered + byStatus.returned),
    cancelPercent: percent(byStatus.cancelled, orders),
    products: products.map((row) => ({
      productId: row._id.toString(),
      name: row.name,
      orders: row.orders,
      sales: row.sales,
    })),
    incomplete,
    paymentsWaiting,
  };
}
