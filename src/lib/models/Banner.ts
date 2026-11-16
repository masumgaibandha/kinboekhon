import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";
import { imageSchema } from "@/lib/models/image-schema";
import type { BannerValues } from "@/lib/validation/banner";

export type BannerDocument = BannerValues & { isDemo: boolean };

const bannerSchema = new Schema<BannerDocument>(
  {
    title: { type: String, required: true },
    link: { type: String, default: "" },
    mobileImage: { type: imageSchema, required: true },
    desktopImage: { type: imageSchema, required: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: false },
    // Demo data for testing, removed by `npm run demo:clear`.
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bannerSchema.index({ active: 1, sortOrder: 1 });

export const BannerModel = registerModel<BannerDocument>("Banner", bannerSchema);
