import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";

import { CARD_FIELDS, PRODUCTS_TAG, productTag, toCard, type CardDoc, type ProductCardData } from "@/lib/catalog";
import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { MAX_EXTRAS } from "@/lib/orders/limits";
import { getSettings } from "@/lib/settings";

type UpsellDoc = CardDoc & { stock?: number };

// "এটাও নিন" for a product page: the products the admin picked, else up to 3 others from the same category.
// Inactive products are left out, and out of stock ones too when Settings hide ordering at 0 stock.
export async function getUpsellProducts(productId: string, upsellIds: string[], categoryId: string | null): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");

  await connectMongoose();
  const { hideOrderWhenOutOfStock } = await getSettings();
  const inStock = hideOrderWhenOutOfStock ? { stock: { $gt: 0 } } : {};
  const fields = { ...CARD_FIELDS, stock: 1 };
  const self = new Types.ObjectId(productId);

  let docs: UpsellDoc[] = [];
  if (upsellIds.length > 0) {
    const ids = upsellIds.map((id) => new Types.ObjectId(id));
    const found = await ProductModel.find({ _id: { $in: ids, $ne: self }, active: true, ...inStock }, fields).lean<UpsellDoc[]>();
    docs = upsellIds.flatMap((id) => found.filter((doc) => String(doc._id) === id));
  }
  if (docs.length === 0 && categoryId) {
    docs = await ProductModel.find({ _id: { $ne: self }, active: true, categoryId, ...inStock }, fields)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(MAX_EXTRAS)
      .lean<UpsellDoc[]>();
  }

  const cards = docs.slice(0, MAX_EXTRAS).map(toCard);
  // A product reaching 0 stock refreshes its own tag, so this list follows it.
  for (const card of cards) cacheTag(productTag(card.slug));
  return cards;
}
