import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { BannerModel } from "@/lib/models/Banner";
import { pickImages, type ProductImage } from "@/lib/product-images";

export const BANNERS_TAG = "banners";

export interface ShopBanner {
  id: string;
  title: string;
  link: string;
  mobileImage: ProductImage;
  desktopImage: ProductImage;
}

export interface BannerDoc {
  _id: Types.ObjectId;
  title: string;
  link?: string;
  mobileImage: ProductImage;
  desktopImage: ProductImage;
  sortOrder?: number;
  active?: boolean;
  updatedAt?: Date;
}

export function toShopBanner(doc: BannerDoc): ShopBanner {
  const [mobileImage, desktopImage] = pickImages([doc.mobileImage, doc.desktopImage]);
  return { id: String(doc._id), title: doc.title, link: doc.link ?? "", mobileImage, desktopImage };
}

// Active banners in the admin's order, for the home page slider.
export async function getActiveBanners(): Promise<ShopBanner[]> {
  "use cache";
  cacheTag(BANNERS_TAG);
  cacheLife("max");

  await connectMongoose();
  const docs = await BannerModel.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean<BannerDoc[]>();
  return docs.map(toShopBanner);
}
