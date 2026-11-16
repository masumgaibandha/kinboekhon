import { revalidateTag } from "next/cache";

import { productTag } from "@/lib/catalog";
import { connectMongoose } from "@/lib/db";
import { AdSpendModel } from "@/lib/models/AdSpend";
import { CounterModel } from "@/lib/models/Counter";
import { CustomerModel } from "@/lib/models/Customer";
import { DeliveryCheckModel } from "@/lib/models/DeliveryCheck";
import { IncompleteOrderModel } from "@/lib/models/IncompleteOrder";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { SmsLogModel } from "@/lib/models/SmsLog";
import { StockMoveModel } from "@/lib/models/StockMove";
import type { TestDataCounts } from "@/lib/reset/test-data-labels";

// Calls are entries in each order's history; payments are orders with an advance payment.
async function countCallLogs(): Promise<number> {
  const [row] = await OrderModel.aggregate<{ total: number }>([
    { $project: { calls: { $size: { $filter: { input: { $ifNull: ["$statusHistory", []] }, cond: { $eq: ["$$this.kind", "call"] } } } } } },
    { $group: { _id: null, total: { $sum: "$calls" } } },
  ]);
  return row?.total ?? 0;
}

export async function countTestData(): Promise<TestDataCounts> {
  await connectMongoose();
  const [orders, customers, callLogs, fraudChecks, adSpend, stockMoves, payments, incompleteOrders, productsWithStock, smsLogs] =
    await Promise.all([
      OrderModel.countDocuments(),
      CustomerModel.countDocuments(),
      countCallLogs(),
      DeliveryCheckModel.countDocuments(),
      AdSpendModel.countDocuments(),
      StockMoveModel.countDocuments(),
      OrderModel.countDocuments({ "payment.status": { $ne: "cod" } }),
      IncompleteOrderModel.countDocuments(),
      ProductModel.countDocuments({ stock: { $ne: 0 } }),
      SmsLogModel.countDocuments(),
    ]);
  return { orders, customers, callLogs, fraudChecks, adSpend, stockMoves, payments, incompleteOrders, productsWithStock, smsLogs };
}

// Sets every product's stock to 0 without touching updatedAt, then refreshes pages of products that had stock.
async function zeroAllStock(): Promise<void> {
  const inStock = await ProductModel.find({ stock: { $gt: 0 } }, { slug: 1 }).lean<{ slug: string }[]>();
  await ProductModel.updateMany({ stock: { $ne: 0 } }, { $set: { stock: 0 } }, { timestamps: false });
  for (const { slug } of inStock) revalidateTag(productTag(slug), "max");
}

// Deletes orders (with their calls, payments and SMS log), incomplete orders, customers, fraud checks, ad spend and stock moves,
// sets all stock to 0, then restarts order numbers at KE10001.
export async function deleteTestData(): Promise<void> {
  await connectMongoose();
  await Promise.all([
    OrderModel.deleteMany({}),
    IncompleteOrderModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    DeliveryCheckModel.deleteMany({}),
    AdSpendModel.deleteMany({}),
    StockMoveModel.deleteMany({}),
    SmsLogModel.deleteMany({}),
    zeroAllStock(),
  ]);
  await CounterModel.deleteOne({ _id: "order" });
}
