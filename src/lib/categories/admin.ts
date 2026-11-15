import { isValidObjectId } from "mongoose";

import { toShopCategory, type CategoryDoc, type ShopCategory } from "@/lib/categories/shop";
import { connectMongoose } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import { ProductModel } from "@/lib/models/Product";

export type AdminCategoryRow = ShopCategory & { sortOrder: number; products: number };

export interface AdminCategory {
  category: ShopCategory & { sortOrder: number };
  version: string;
}

export async function listCategoriesForAdmin(): Promise<AdminCategoryRow[]> {
  await connectMongoose();
  const [docs, counts] = await Promise.all([
    CategoryModel.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean<CategoryDoc[]>(),
    ProductModel.aggregate<{ _id: unknown; count: number }>([
      { $match: { categoryId: { $ne: null } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]),
  ]);
  const countOf = new Map(counts.map((row) => [String(row._id), row.count]));
  return docs.map((doc) => ({ ...toShopCategory(doc), sortOrder: doc.sortOrder ?? 0, products: countOf.get(String(doc._id)) ?? 0 }));
}

// `version` changes on every save.
export async function getCategoryForAdmin(id: string): Promise<AdminCategory | null> {
  if (!isValidObjectId(id)) return null;
  await connectMongoose();
  const doc = await CategoryModel.findById(id).lean<CategoryDoc>();
  if (!doc) return null;
  return { category: { ...toShopCategory(doc), sortOrder: doc.sortOrder ?? 0 }, version: doc.updatedAt?.toISOString() ?? "" };
}

// Choices for the product form's Category select.
export async function categoryOptions(): Promise<{ id: string; name: string }[]> {
  await connectMongoose();
  const docs = await CategoryModel.find({}, { name: 1 }).sort({ sortOrder: 1, createdAt: 1 }).lean<CategoryDoc[]>();
  return docs.map((doc) => ({ id: String(doc._id), name: doc.name }));
}
