import { isValidObjectId } from "mongoose";

import { toShopBanner, type BannerDoc, type ShopBanner } from "@/lib/banners/shop";
import { connectMongoose } from "@/lib/db";
import { BannerModel } from "@/lib/models/Banner";
import type { BannerValues } from "@/lib/validation/banner";

export type AdminBannerRow = ShopBanner & { sortOrder: number; active: boolean };

export async function listBannersForAdmin(): Promise<AdminBannerRow[]> {
  await connectMongoose();
  const docs = await BannerModel.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean<BannerDoc[]>();
  return docs.map((doc) => ({ ...toShopBanner(doc), sortOrder: doc.sortOrder ?? 0, active: doc.active ?? false }));
}

// The saved values for the edit form; `version` changes on every save.
export async function getBannerForAdmin(id: string): Promise<{ banner: BannerValues; version: string } | null> {
  if (!isValidObjectId(id)) return null;
  await connectMongoose();
  const doc = await BannerModel.findById(id).lean<BannerDoc>();
  if (!doc) return null;
  const { title, link, mobileImage, desktopImage } = toShopBanner(doc);
  return {
    banner: { title, link, mobileImage, desktopImage, sortOrder: doc.sortOrder ?? 0, active: doc.active ?? false },
    version: doc.updatedAt?.toISOString() ?? "",
  };
}
