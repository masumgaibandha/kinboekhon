import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import type { ProductImage } from "@/lib/product-images";
import { SLUG_PATTERN } from "@/lib/validation/product";

export const CATEGORIES_TAG = "categories";

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  image: ProductImage | null;
}

export interface CategoryDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image?: ProductImage | null;
  sortOrder?: number;
  updatedAt?: Date;
}

export function toShopCategory(doc: CategoryDoc): ShopCategory {
  const image = doc.image ? { publicId: doc.image.publicId, width: doc.image.width, height: doc.image.height } : null;
  return { id: String(doc._id), name: doc.name, slug: doc.slug, image };
}

// All categories in the admin's order, for the header menu and the home grid.
export async function getCategories(): Promise<ShopCategory[]> {
  "use cache";
  cacheTag(CATEGORIES_TAG);
  cacheLife("max");

  await connectMongoose();
  const docs = await CategoryModel.find({}, { name: 1, slug: 1, image: 1 }).sort({ sortOrder: 1, createdAt: 1 }).lean<CategoryDoc[]>();
  return docs.map(toShopCategory);
}

export async function getCategoryBySlug(slug: string): Promise<ShopCategory | null> {
  "use cache";
  cacheTag(CATEGORIES_TAG);
  cacheLife("max");

  if (!SLUG_PATTERN.test(slug)) return null;
  await connectMongoose();
  const doc = await CategoryModel.findOne({ slug }, { name: 1, slug: 1, image: 1 }).lean<CategoryDoc>();
  return doc ? toShopCategory(doc) : null;
}
