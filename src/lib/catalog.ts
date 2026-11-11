import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { pickImages, type ProductImage } from "@/lib/product-images";

export const PRODUCTS_TAG = "products";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: ProductImage | null;
}

interface CardDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  images?: ProductImage[];
}

export async function getActiveProducts(): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");

  await connectMongoose();
  const docs = await ProductModel.find(
    { active: true },
    { name: 1, slug: 1, price: 1, oldPrice: 1, images: { $slice: 1 } },
  )
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean<CardDoc[]>();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    oldPrice: doc.oldPrice ?? null,
    image: pickImages(doc.images)[0] ?? null,
  }));
}
