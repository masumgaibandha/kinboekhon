import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";
import { PROVIDER_IDS, type CourierScore, type ProviderId } from "@/lib/fraud/providers/types";

export const CHECK_SOURCES = [...PROVIDER_IDS, "manual"] as const;
export type CheckSource = ProviderId | "manual";

// One row per phone and source: the newest courier lookup, or the admin's manual entry.
export interface DeliveryCheckDocument {
  phone: string;
  source: CheckSource;
  // A provider's latest attempt. A manual entry is always "found".
  status: "found" | "no_history" | "error";
  // Counts as typed in a manual entry; null on a provider row and on a manual entry with only a rating.
  delivered: number | null;
  failed: number | null;
  total: number | null;
  // A provider's score from the last good lookup; null on a manual entry.
  courierScore: CourierScore | null;
  // Time of the last good lookup or of the manual entry.
  checkedAt: Date | null;
  error: string;
  errorAt: Date | null;
  pathaoRating: string;
  note: string;
}

const courierScoreSchema = new Schema<CourierScore>(
  {
    deliveryRatio: { type: Number, default: null },
    cancellationRatio: { type: Number, default: null },
    volumeBand: { type: String, default: "" },
    volumeRange: { type: String, default: "" },
    totalReports: { type: Number, default: 0 },
    doubtfulReports: { type: Boolean, default: false },
    score: { type: Number, default: null },
    level: { type: String, default: "" },
  },
  { _id: false },
);

const deliveryCheckSchema = new Schema<DeliveryCheckDocument>(
  {
    phone: { type: String, required: true },
    source: { type: String, enum: CHECK_SOURCES, required: true },
    status: { type: String, enum: ["found", "no_history", "error"], required: true },
    delivered: { type: Number, default: null },
    failed: { type: Number, default: null },
    total: { type: Number, default: null },
    courierScore: { type: courierScoreSchema, default: null },
    checkedAt: { type: Date, default: null },
    error: { type: String, default: "" },
    errorAt: { type: Date, default: null },
    pathaoRating: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

deliveryCheckSchema.index({ phone: 1, source: 1 }, { unique: true });

export const DeliveryCheckModel = registerModel<DeliveryCheckDocument>("DeliveryCheck", deliveryCheckSchema);
