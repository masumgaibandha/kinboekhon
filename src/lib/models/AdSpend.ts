import { Schema, type Types } from "mongoose";

import { registerModel } from "@/lib/db";

export interface AdSpendDocument {
  day: Date;
  productId: Types.ObjectId;
  amountUsd: number;
  usdRate: number;
  amountBdt: number;
}

const adSpendSchema = new Schema<AdSpendDocument>(
  {
    // 00:00 Dhaka time of the day the money was spent.
    day: { type: Date, required: true },
    productId: { type: Schema.Types.ObjectId, required: true },
    amountUsd: { type: Number, required: true, min: 0 },
    usdRate: { type: Number, required: true, min: 0 },
    amountBdt: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

adSpendSchema.index({ day: 1, productId: 1 }, { unique: true });
adSpendSchema.index({ day: -1 });

export const AdSpendModel = registerModel<AdSpendDocument>("AdSpend", adSpendSchema);
