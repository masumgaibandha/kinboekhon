import { connectMongoose } from "@/lib/db";
import { DEFAULT_FRAUD_SETTINGS, type FraudSettings } from "@/lib/fraud/risk";
import { SettingsModel } from "@/lib/models/Settings";

export function withFraudDefaults(saved?: Partial<FraudSettings>): FraudSettings {
  return { ...DEFAULT_FRAUD_SETTINGS, ...saved };
}

// Uncached admin read: risk label thresholds and the booking money amount.
export async function getFraudSettings(): Promise<FraudSettings> {
  await connectMongoose();
  const doc = await SettingsModel.findOne({ key: "main" }, { _id: 0, fraud: 1 }).lean<{ fraud?: Partial<FraudSettings> }>();
  return withFraudDefaults(doc?.fraud);
}
