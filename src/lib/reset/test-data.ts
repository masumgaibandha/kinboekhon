import { connectMongoose } from "@/lib/db";
import { AdSpendModel } from "@/lib/models/AdSpend";
import { CounterModel } from "@/lib/models/Counter";
import { CustomerModel } from "@/lib/models/Customer";
import { DeliveryCheckModel } from "@/lib/models/DeliveryCheck";
import { OrderModel } from "@/lib/models/Order";
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
  const [orders, customers, callLogs, fraudChecks, adSpend, stockMoves, payments] = await Promise.all([
    OrderModel.countDocuments(),
    CustomerModel.countDocuments(),
    countCallLogs(),
    DeliveryCheckModel.countDocuments(),
    AdSpendModel.countDocuments(),
    StockMoveModel.countDocuments(),
    OrderModel.countDocuments({ "payment.status": { $ne: "cod" } }),
  ]);
  return { orders, customers, callLogs, fraudChecks, adSpend, stockMoves, payments };
}

// Deletes orders (with their calls and payments), customers, fraud checks, ad spend and stock moves, then restarts order numbers at KE10001.
export async function deleteTestData(): Promise<void> {
  await connectMongoose();
  await Promise.all([
    OrderModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    DeliveryCheckModel.deleteMany({}),
    AdSpendModel.deleteMany({}),
    StockMoveModel.deleteMany({}),
  ]);
  await CounterModel.deleteOne({ _id: "order" });
}
