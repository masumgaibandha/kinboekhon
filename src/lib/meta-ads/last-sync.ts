import { connectMongoose } from "@/lib/db";
import { MetaAdsSyncModel, type MetaAdsSyncDocument } from "@/lib/models/MetaAdsSync";

export type LastSync = Pick<MetaAdsSyncDocument, "at" | "trigger" | "ok" | "rows" | "error">;

export async function getLastSync(): Promise<LastSync | null> {
  await connectMongoose();
  return MetaAdsSyncModel.findOne({ key: "main" }, { _id: 0, at: 1, trigger: 1, ok: 1, rows: 1, error: 1 }).lean<LastSync>();
}
