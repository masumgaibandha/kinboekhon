import type { Types } from "mongoose";

import { TRY_AGAIN, adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { AdCampaignProductModel } from "@/lib/models/AdCampaignProduct";
import { ProductModel } from "@/lib/models/Product";

export interface CampaignProduct {
  productId: string;
  version: string;
}

// Campaign id to the product chosen for it and the choice's version.
export async function getCampaignProducts(): Promise<Map<string, CampaignProduct>> {
  await connectMongoose();
  const rows = await AdCampaignProductModel.find({}).lean<{ campaignId: string; productId: Types.ObjectId; updatedAt: Date }[]>();
  return new Map(rows.map((row) => [row.campaignId, { productId: String(row.productId), version: row.updatedAt.toISOString() }]));
}

export async function saveCampaignProduct(campaignId: string, productId: string): Promise<AdminActionResult> {
  try {
    await connectMongoose();
    if (productId === "") {
      await AdCampaignProductModel.deleteOne({ campaignId });
      return { ok: true, message: "Campaign product cleared." };
    }
    if ((await ProductModel.exists({ _id: productId })) === null) return adminFail("Choose a product.", { productId: "Choose a product." });
    await AdCampaignProductModel.updateOne({ campaignId }, { $set: { productId } }, { upsert: true });
    return { ok: true, message: "Campaign product saved." };
  } catch {
    return adminFail(TRY_AGAIN);
  }
}
