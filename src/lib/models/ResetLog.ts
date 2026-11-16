import { Schema } from "mongoose";

import { appDb } from "@/lib/db";
import type { TestDataCounts } from "@/lib/reset/test-data-labels";

interface ResetLogDocument {
  adminEmail: string;
  dbName: string;
  deleted: TestDataCounts;
  createdAt: Date;
}

// One entry per test data reset from the Settings danger zone.
const resetLogSchema = new Schema<ResetLogDocument>(
  {
    adminEmail: { type: String, required: true },
    dbName: { type: String, required: true },
    deleted: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.ResetLog) appDb.deleteModel("ResetLog");

export const ResetLogModel = appDb.model<ResetLogDocument>("ResetLog", resetLogSchema);
