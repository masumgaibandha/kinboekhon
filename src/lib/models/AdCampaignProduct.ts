import { Schema, type Types } from "mongoose";

import { registerModel } from "@/lib/db";

// The admin's choice of product for a Meta campaign, used when its ads have no orders yet.
export interface AdCampaignProductDocument {
  campaignId: string;
  productId: Types.ObjectId;
  updatedAt: Date;
}

const adCampaignProductSchema = new Schema<AdCampaignProductDocument>(
  {
    campaignId: { type: String, required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const AdCampaignProductModel = registerModel<AdCampaignProductDocument>("AdCampaignProduct", adCampaignProductSchema);
