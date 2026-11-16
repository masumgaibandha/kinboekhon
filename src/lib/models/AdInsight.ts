import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";

// One Meta ad on one day, imported from the Marketing API insights (read only).
export interface AdInsightDocument {
  // 00:00 Dhaka time of the ad account's day.
  day: Date;
  adId: string;
  adName: string;
  adsetId: string;
  adsetName: string;
  campaignId: string;
  campaignName: string;
  // The ad account currency, like USD or BDT.
  currency: string;
  // Spend in the account currency, up to 2 decimals.
  spend: number;
  // Taka per dollar used for a USD account, null for a BDT account.
  usdRate: number | null;
  spendBdt: number;
  impressions: number;
  linkClicks: number;
  purchases: number;
  createdAt: Date;
  updatedAt: Date;
}

const adInsightSchema = new Schema<AdInsightDocument>(
  {
    day: { type: Date, required: true },
    adId: { type: String, required: true },
    adName: { type: String, default: "" },
    adsetId: { type: String, required: true },
    adsetName: { type: String, default: "" },
    campaignId: { type: String, required: true },
    campaignName: { type: String, default: "" },
    currency: { type: String, required: true },
    spend: { type: Number, required: true, min: 0 },
    usdRate: { type: Number, default: null },
    spendBdt: { type: Number, required: true, min: 0 },
    impressions: { type: Number, default: 0 },
    linkClicks: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

adInsightSchema.index({ adId: 1, day: 1 }, { unique: true });
adInsightSchema.index({ day: -1 });

export const AdInsightModel = registerModel<AdInsightDocument>("AdInsight", adInsightSchema);
