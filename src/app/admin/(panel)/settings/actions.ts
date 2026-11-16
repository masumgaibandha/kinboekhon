"use server";

import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { changedFields, INITIAL_VALUES_FIELD, readJsonField } from "@/lib/changed-fields";
import { connectMongoose } from "@/lib/db";
import { relabelAllCustomers } from "@/lib/fraud/customer-risk";
import { SettingsModel } from "@/lib/models/Settings";
import { SETTINGS_KEY, SETTINGS_TAG } from "@/lib/settings";
import { COST_DEFAULT_KEYS, readCostFields } from "@/lib/validation/costs";
import { COURIER_SETTING_KEYS } from "@/lib/validation/courier-settings";
import { FRAUD_SETTING_KEYS } from "@/lib/validation/fraud-settings";
import { adminSettingsSchema } from "@/lib/validation/settings";

export type SaveSettingsResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

function readForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  const checked = (name: string) => formData.get(name) === "on";
  const wallet = (prefix: string) => ({
    enabled: checked(`${prefix}.enabled`),
    number: text(`${prefix}.number`),
    accountType: text(`${prefix}.accountType`),
  });

  return {
    deliveryChargeDhakaCity: text("deliveryChargeDhakaCity"),
    deliveryChargeOutside: text("deliveryChargeOutside"),
    advanceDeliveryDiscount: text("advanceDeliveryDiscount"),
    fullAdvanceDiscount: text("fullAdvanceDiscount"),
    bkash: wallet("bkash"),
    nagad: wallet("nagad"),
    rocket: wallet("rocket"),
    bank: {
      enabled: checked("bank.enabled"),
      bankName: text("bank.bankName"),
      accountName: text("bank.accountName"),
      accountNumber: text("bank.accountNumber"),
      branch: text("bank.branch"),
      routingNumber: text("bank.routingNumber"),
    },
    supportPhone: text("supportPhone"),
    whatsappNumber: text("whatsappNumber"),
    tradeLicense: text("tradeLicense"),
    businessAddress: text("businessAddress"),
    trustBadges: [text("trustBadges.0"), text("trustBadges.1"), text("trustBadges.2")],
    duplicateWindowHours: text("duplicateWindowHours"),
    hideOrderWhenOutOfStock: checked("hideOrderWhenOutOfStock"),
    helpPopup: { enabled: checked("helpPopup.enabled"), title: text("helpPopup.title"), text: text("helpPopup.text") },
    courier: Object.fromEntries(COURIER_SETTING_KEYS.map((key) => [key, text(`courier.${key}`)])),
    costDefaults: readCostFields(formData, "costDefaults", COST_DEFAULT_KEYS),
    ads: { usdRate: text("ads.usdRate"), maxCpa: text("ads.maxCpa") },
    fraud: Object.fromEntries(FRAUD_SETTING_KEYS.map((key) => [key, text(`fraud.${key}`)])),
  };
}

export async function saveSettings(formData: FormData): Promise<SaveSettingsResult> {
  await requireAdmin();

  const parsed = adminSettingsSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  // Write only what the admin changed, so a stale form never overwrites newer values.
  const initial = readJsonField(formData, INITIAL_VALUES_FIELD);
  if (!initial) return { ok: false, message: "This page is out of date. Reload it and try again.", fieldErrors: {} };
  const changes = changedFields(parsed.data, initial);
  if (Object.keys(changes).length === 0) return { ok: true };

  try {
    await connectMongoose();
    await SettingsModel.updateOne({ key: SETTINGS_KEY }, { $set: changes }, { upsert: true });
    // New thresholds give every checked phone a fresh risk label.
    if (Object.keys(changes).some((path) => path.startsWith("fraud."))) {
      await relabelAllCustomers(parsed.data.fraud);
    }
  } catch {
    return { ok: false, message: "Could not save settings. Try again.", fieldErrors: {} };
  }

  updateTag(SETTINGS_TAG);
  return { ok: true };
}
