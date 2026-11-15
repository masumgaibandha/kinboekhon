import { isValidObjectId, type Types } from "mongoose";

import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { DEFAULT_LOW_STOCK_LEVEL, ProductModel } from "@/lib/models/Product";
import { StockMoveModel, type StockMoveDocument } from "@/lib/models/StockMove";
import { recordStockMove } from "@/lib/stock/record-move";
import type { StockAdjustment, StockPurchase } from "@/lib/validation/stock";

export const STOCK_HISTORY_LIMIT = 100;

export type StockMoveItem = Pick<StockMoveDocument, "kind" | "change" | "balance" | "unitCost" | "note" | "orderNumber" | "createdAt"> & {
  id: string;
};

export interface ProductStock {
  stock: number;
  lowStockLevel: number;
  moves: StockMoveItem[];
}

export async function getProductStock(id: string): Promise<ProductStock | null> {
  if (!isValidObjectId(id)) return null;
  await connectMongoose();
  const product = await ProductModel.findById(id, { stock: 1, lowStockLevel: 1 }).lean<{ stock?: number; lowStockLevel?: number }>();
  if (!product) return null;
  const moves = await StockMoveModel.find({ productId: id })
    .sort({ createdAt: -1 })
    .limit(STOCK_HISTORY_LIMIT)
    .lean<(StockMoveDocument & { _id: Types.ObjectId })[]>();
  return {
    stock: product.stock ?? 0,
    lowStockLevel: product.lowStockLevel ?? DEFAULT_LOW_STOCK_LEVEL,
    moves: moves.map(({ _id, kind, change, balance, unitCost, note, orderNumber, createdAt }) => ({
      id: String(_id),
      kind,
      change,
      balance,
      unitCost,
      note,
      orderNumber,
      createdAt,
    })),
  };
}

const NOT_FOUND = "Product not found.";

export async function addStockPurchase({ productId, quantity, unitCost, note }: StockPurchase): Promise<AdminActionResult> {
  const stock = await recordStockMove(productId, "purchase", quantity, { unitCost, note });
  if (stock === null) return adminFail(NOT_FOUND);
  return { ok: true, message: `Added ${quantity}. Stock is now ${stock}.` };
}

export async function adjustStock({ productId, change, reason }: StockAdjustment): Promise<AdminActionResult> {
  const stock = await recordStockMove(productId, "adjustment", change, { note: reason });
  if (stock === null) return adminFail(NOT_FOUND);
  return { ok: true, message: `Stock adjusted. It is now ${stock}.` };
}

// Writes only if the level is still the one the form was loaded with; old products have no saved level yet.
export async function saveLowStockLevel(productId: string, level: number, initial: number): Promise<AdminActionResult> {
  if (level === initial) return adminFail("Nothing changed.");
  await connectMongoose();
  const current =
    initial === DEFAULT_LOW_STOCK_LEVEL
      ? { $or: [{ lowStockLevel: initial }, { lowStockLevel: { $exists: false } }] }
      : { lowStockLevel: initial };
  const updated = await ProductModel.updateOne({ _id: productId, ...current }, { $set: { lowStockLevel: level } }, { timestamps: false });
  if (updated.modifiedCount > 0) return { ok: true, message: "Low-stock level saved." };
  const exists = await ProductModel.exists({ _id: productId });
  return adminFail(exists ? "This product was changed since you opened it. Reload the page." : NOT_FOUND);
}
