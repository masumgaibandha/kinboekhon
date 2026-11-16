import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";

export const SYNC_TRIGGERS = ["cron", "manual"] as const;
export type SyncTrigger = (typeof SYNC_TRIGGERS)[number];

// The last Meta Ads import (single document, `key: "main"`).
export interface MetaAdsSyncDocument {
  key: "main";
  at: Date;
  trigger: SyncTrigger;
  ok: boolean;
  rows: number;
  error: string;
}

const metaAdsSyncSchema = new Schema<MetaAdsSyncDocument>(
  {
    key: { type: String, required: true, unique: true },
    at: { type: Date, required: true },
    trigger: { type: String, enum: SYNC_TRIGGERS, required: true },
    ok: { type: Boolean, required: true },
    rows: { type: Number, default: 0 },
    error: { type: String, default: "" },
  },
  { versionKey: false },
);

export const MetaAdsSyncModel = registerModel<MetaAdsSyncDocument>("MetaAdsSync", metaAdsSyncSchema, "metaadssync");
