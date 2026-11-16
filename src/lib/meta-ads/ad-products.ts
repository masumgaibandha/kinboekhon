import type { Types } from "mongoose";

import { AdCampaignProductModel } from "@/lib/models/AdCampaignProduct";
import { OrderModel } from "@/lib/models/Order";
import { ITEMS_STAGE } from "@/lib/orders/order-items";

export interface AdProducts {
  // Ad id to the product most of its orders were placed from.
  byAd: Map<string, string>;
  // Campaign id to the product the admin chose for it.
  byCampaign: Map<string, string>;
}

// The product the orders of each ad (utm_content = ad id) were placed from, most orders first, over all time.
async function productsFromOrders(): Promise<Map<string, string>> {
  const rows = await OrderModel.aggregate<{ _id: { ad: string; product: Types.ObjectId }; count: number }>([
    { $match: { "tracking.utmContent": { $type: "string" } } },
    ITEMS_STAGE,
    { $group: { _id: { ad: "$tracking.utmContent", product: { $arrayElemAt: ["$items.productId", 0] } }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const byAd = new Map<string, string>();
  for (const row of rows) if (row._id.product && !byAd.has(row._id.ad)) byAd.set(row._id.ad, String(row._id.product));
  return byAd;
}

export async function getAdProducts(): Promise<AdProducts> {
  const [byAd, mappings] = await Promise.all([
    productsFromOrders(),
    AdCampaignProductModel.find({}, { campaignId: 1, productId: 1 }).lean<{ campaignId: string; productId: Types.ObjectId }[]>(),
  ]);
  return { byAd, byCampaign: new Map(mappings.map((row) => [row.campaignId, String(row.productId)])) };
}

// The ad's own orders decide first; without any, the campaign's chosen product; null when neither is known.
export function productOfAd(products: AdProducts, adId: string, campaignId: string): string | null {
  return products.byAd.get(adId) ?? products.byCampaign.get(campaignId) ?? null;
}
