import { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { AdSpendModel } from "@/lib/models/AdSpend";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import type { OrderStatus } from "@/lib/orders/enums";
import { startingCosts } from "@/lib/products";
import { courierCostByProduct, parcelGroups } from "@/lib/profit/parcel-courier";
import { NO_ORDERS, profitRow, totalOf, type OrderCounts, type ProfitNumbers, type ProfitRow } from "@/lib/profit/profit-math";
import { getAdSettings, getCostDefaults, getCourierSettings } from "@/lib/settings";
import type { ProductCosts } from "@/lib/validation/costs";
import { rangeFilter } from "@/lib/validation/report-range";

export interface ProfitReport {
  rows: ProfitRow[];
  total: ProfitNumbers;
  maxCpa: number;
}

// Orders that passed the confirmation call, whatever happened to them after it.
const CONFIRMED: OrderStatus[] = ["confirmed", "shipped", "delivered", "returned"];

const when = (condition: object, value: unknown) => ({ $sum: { $cond: [condition, value, 0] } });
const isStatus = (status: OrderStatus) => ({ $eq: ["$status", status] });

type OrderRow = OrderCounts & { _id: Types.ObjectId; name: string };

function orderCounts(start: Date | null, end: Date | null) {
  const createdAt = rangeFilter(start, end);
  return OrderModel.aggregate<OrderRow>([
    { $match: createdAt ? { createdAt } : {} },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$product.productId",
        name: { $first: "$product.name" },
        orders: { $sum: 1 },
        confirmed: when({ $in: ["$status", CONFIRMED] }, 1),
        delivered: when(isStatus("delivered"), 1),
        returned: when(isStatus("returned"), 1),
        revenue: when(isStatus("delivered"), "$total"),
        deliveredQuantity: when(isStatus("delivered"), "$quantity"),
        codCollected: when(isStatus("delivered"), "$payment.dueOnDelivery"),
      },
    },
  ]);
}

function adSpendTotals(start: Date | null, end: Date | null) {
  const day = rangeFilter(start, end);
  return AdSpendModel.aggregate<{ _id: Types.ObjectId; amount: number }>([
    { $match: day ? { day } : {} },
    { $group: { _id: "$productId", amount: { $sum: "$amountBdt" } } },
  ]);
}

// Profit per product for orders placed and ad spend days in [start, end); an open side has no limit.
export async function getProfitReport(start: Date | null, end: Date | null): Promise<ProfitReport> {
  await connectMongoose();
  const [orderRows, spendRows, parcels, defaults, ads, courier] = await Promise.all([
    orderCounts(start, end),
    adSpendTotals(start, end),
    parcelGroups(start, end),
    getCostDefaults(),
    getAdSettings(),
    getCourierSettings(),
  ]);

  const counts = new Map(orderRows.map(({ _id, ...row }) => [String(_id), row]));
  const spend = new Map(spendRows.map((row) => [String(row._id), row.amount]));
  const ids = [...new Set([...counts.keys(), ...spend.keys()])];
  const products = await ProductModel.find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } }, { name: 1, costs: 1 }).lean<
    { _id: Types.ObjectId; name: string; costs?: Partial<ProductCosts> }[]
  >();
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const costsOf = (id: string) => startingCosts(defaults, byId.get(id)?.costs);
  const courierCosts = courierCostByProduct(parcels, (id) => costsOf(id).weightGrams, courier);

  const rows = ids
    .map((id) => {
      const product = byId.get(id);
      const { name: snapshotName, ...orders } = counts.get(id) ?? { ...NO_ORDERS, name: undefined };
      return profitRow(
        { productId: id, name: product?.name ?? snapshotName ?? "Removed product" },
        orders,
        spend.get(id) ?? 0,
        costsOf(id),
        courierCosts.get(id) ?? 0,
        ads.maxCpa,
        courier.codPercent,
      );
    })
    .sort((a, b) => b.adSpend - a.adSpend || b.orders - a.orders);

  return { rows, total: totalOf(rows), maxCpa: ads.maxCpa };
}
