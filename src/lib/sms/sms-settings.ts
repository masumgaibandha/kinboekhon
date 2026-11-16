import { connectMongoose } from "@/lib/db";
import { SettingsModel } from "@/lib/models/Settings";
import { AUTO_TEMPLATES, DEFAULT_SMS_TEXTS } from "@/lib/sms/templates";
import type { SmsSettings } from "@/lib/validation/sms-settings";

export const DEFAULT_SMS_SETTINGS: SmsSettings = {
  pricePerPart: 0.35,
  templates: Object.fromEntries(
    AUTO_TEMPLATES.map((key) => [key, { enabled: true, text: DEFAULT_SMS_TEXTS[key] }]),
  ) as SmsSettings["templates"],
};

type SavedSms = { pricePerPart?: number; templates?: Partial<Record<keyof SmsSettings["templates"], Partial<SmsSettings["templates"]["received"]>>> };

// Saves write only changed fields, so a saved template may hold only some of its fields.
export function withSmsDefaults(saved?: SavedSms): SmsSettings {
  const templates = Object.fromEntries(
    AUTO_TEMPLATES.map((key) => [key, { ...DEFAULT_SMS_SETTINGS.templates[key], ...saved?.templates?.[key] }]),
  ) as SmsSettings["templates"];
  return { pricePerPart: saved?.pricePerPart ?? DEFAULT_SMS_SETTINGS.pricePerPart, templates };
}

// Uncached admin read: SMS templates and the price per part.
export async function getSmsSettings(): Promise<{ sms: SmsSettings; version: string }> {
  await connectMongoose();
  const doc = await SettingsModel.findOne({ key: "main" }, { _id: 0, sms: 1, updatedAt: 1 }).lean<{
    sms?: SavedSms;
    updatedAt?: Date;
  }>();
  return { sms: withSmsDefaults(doc?.sms), version: doc?.updatedAt?.toISOString() ?? "" };
}
