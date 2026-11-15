import { revalidateTag } from "next/cache";
import type { Types } from "mongoose";

import { productTag } from "@/lib/catalog";
import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { StockMoveModel, type StockMoveKind } from "@/lib/models/StockMove";

interface MoveDetails {
  note?: string;
  unitCost?: number;
  orderNumber?: string;
}

// Changes a product's stock by `change` in one atomic step and logs the move with the new balance.
// Returns the new stock, or null when the product is gone.
export async function recordStockMove(
  productId: Types.ObjectId | string,
  kind: StockMoveKind,
  change: number,
  details: MoveDetails = {},
): Promise<number | null> {
  await connectMongoose();
  const product = await ProductModel.findOneAndUpdate(
    { _id: productId },
    { $inc: { stock: change } },
    { new: true, projection: { stock: 1, slug: 1 }, timestamps: false },
  ).lean<{ _id: Types.ObjectId; stock: number; slug: string }>();
  if (!product) return null;

  await StockMoveModel.create({ productId: product._id, kind, change, balance: product.stock, ...details });
  // The landing page can hide its order button at 0 stock, so it refreshes when the product runs out or comes back.
  const before = product.stock - change;
  if (before > 0 !== product.stock > 0) revalidateTag(productTag(product.slug), "max");
  return product.stock;
}
