import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { DEFAULT_LOW_STOCK_LEVEL, ProductModel } from "@/lib/models/Product";
import { OrderModel } from "@/lib/models/Order";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  lowStockLevel: number;
}

// Active products at or below their low-stock level, lowest stock first.
export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  await connectMongoose();
  const rows = await ProductModel.aggregate<{ _id: Types.ObjectId; name: string; stock: number; lowStockLevel: number }>([
    { $match: { active: true } },
    {
      $project: {
        name: 1,
        stock: { $ifNull: ["$stock", 0] },
        lowStockLevel: { $ifNull: ["$lowStockLevel", DEFAULT_LOW_STOCK_LEVEL] },
      },
    },
    { $match: { $expr: { $lte: ["$stock", "$lowStockLevel"] } } },
    { $sort: { stock: 1, name: 1 } },
  ]);
  return rows.map((row) => ({ id: String(row._id), name: row.name, stock: row.stock, lowStockLevel: row.lowStockLevel }));
}

export interface StockShortfall {
  id: string;
  name: string;
  confirmedUnits: number;
  stock: number;
}

// Products whose confirmed orders, not sent to the courier yet, need more units than are in stock.
export async function getStockShortfalls(): Promise<StockShortfall[]> {
  await connectMongoose();
  const needs = await OrderModel.aggregate<{ _id: Types.ObjectId; units: number }>([
    { $match: { status: "confirmed" } },
    { $group: { _id: "$product.productId", units: { $sum: "$quantity" } } },
  ]);
  if (needs.length === 0) return [];
  const stocks = await getProductStocks(needs.map((need) => need._id));
  return needs
    .map((need) => {
      const product = stocks.get(String(need._id));
      return { id: String(need._id), name: product?.name ?? "Deleted product", confirmedUnits: need.units, stock: product?.stock ?? 0 };
    })
    .filter((row) => row.confirmedUnits > row.stock)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Current stock and name per product id.
export async function getProductStocks(ids: (Types.ObjectId | string)[]): Promise<Map<string, { name: string; stock: number }>> {
  await connectMongoose();
  const docs = await ProductModel.find({ _id: { $in: ids } }, { name: 1, stock: 1 }).lean<{ _id: Types.ObjectId; name: string; stock?: number }[]>();
  return new Map(docs.map((doc) => [String(doc._id), { name: doc.name, stock: doc.stock ?? 0 }]));
}
