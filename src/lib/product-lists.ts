import { cacheLife, cacheTag } from "next/cache";

import { CARD_FIELDS, PRODUCTS_TAG, toCard, type CardDoc, type ProductCardData } from "@/lib/catalog";
import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { escapeRegex } from "@/lib/regex";

export const HOME_LIST_SIZE = 8;
const SEARCH_LIMIT = 40;

async function findCards(filter: object, sort: Record<string, 1 | -1>, limit = 0): Promise<ProductCardData[]> {
  await connectMongoose();
  const docs = await ProductModel.find({ active: true, ...filter }, CARD_FIELDS).sort(sort).limit(limit).lean<CardDoc[]>();
  return docs.map(toCard);
}

// Products the admin marked Popular, in their sort order.
export async function getPopularProducts(): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");
  return findCards({ popular: true }, { sortOrder: 1, createdAt: -1 }, HOME_LIST_SIZE);
}

export async function getNewProducts(): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");
  return findCards({}, { createdAt: -1 }, HOME_LIST_SIZE);
}

export async function getCategoryProducts(categoryId: string): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");
  return findCards({ categoryId }, { sortOrder: 1, createdAt: -1 });
}

// Uncached: every typed search is different. Matches the product name, ignoring case.
export async function searchProducts(query: string): Promise<ProductCardData[]> {
  return findCards({ name: { $regex: escapeRegex(query), $options: "i" } }, { sortOrder: 1, createdAt: -1 }, SEARCH_LIMIT);
}
