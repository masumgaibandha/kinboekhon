import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { pickImages, type ProductImage } from "@/lib/product-images";
import { toProductInput, type ProductDoc } from "@/lib/products";
import { SLUG_PATTERN, type ProductInput } from "@/lib/validation/product";

export const PRODUCTS_TAG = "products";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: ProductImage | null;
}

interface CardDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  images?: ProductImage[];
}

export async function getActiveProducts(): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");

  await connectMongoose();
  const docs = await ProductModel.find(
    { active: true },
    { name: 1, slug: 1, price: 1, images: { $slice: 1 } },
  )
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean<CardDoc[]>();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    image: pickImages(doc.images)[0] ?? null,
  }));
}

export function productTag(slug: string): string {
  return `product-${slug}`;
}

export type LandingProduct = ProductInput & { id: string };

// Landing page data for an active product, or null for an inactive or unknown slug.
export async function getProductBySlug(slug: string): Promise<LandingProduct | null> {
  "use cache";
  cacheTag(productTag(slug));
  cacheLife("max");

  if (!SLUG_PATTERN.test(slug)) return null;
  await connectMongoose();
  const doc = await ProductModel.findOne({ slug, active: true }).lean<ProductDoc>();
  return doc ? { ...toProductInput(doc), id: String(doc._id) } : null;
}

export async function getActiveSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");

  await connectMongoose();
  const docs = await ProductModel.find({ active: true }, { slug: 1 }).lean<{ slug: string }[]>();
  return docs.map((doc) => doc.slug);
}
