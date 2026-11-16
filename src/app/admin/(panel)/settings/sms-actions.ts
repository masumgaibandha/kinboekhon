"use server";

import { requireAdmin } from "@/lib/admin-session";
import { FIX_FIELDS, TRY_AGAIN, adminFail, type AdminActionResult } from "@/lib/admin-result";
import { changedFields, INITIAL_VALUES_FIELD, readJsonField } from "@/lib/changed-fields";
import { connectMongoose } from "@/lib/db";
import { SettingsModel } from "@/lib/models/Settings";
import { SETTINGS_KEY } from "@/lib/settings";
import { AUTO_TEMPLATES } from "@/lib/sms/templates";
import { smsSettingsSchema } from "@/lib/validation/sms-settings";

function readForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    pricePerPart: text("pricePerPart"),
    templates: Object.fromEntries(
      AUTO_TEMPLATES.map((key) => [key, { enabled: formData.get(`templates.${key}.enabled`) === "on", text: text(`templates.${key}.text`) }]),
    ),
  };
}

export async function saveSmsSettings(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = smsSettingsSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return adminFail(FIX_FIELDS, fieldErrors);
  }

  // Write only what the admin changed, so a stale form never overwrites newer values.
  const initial = readJsonField(formData, INITIAL_VALUES_FIELD);
  if (!initial) return adminFail("This page is out of date. Reload it and try again.");
  const changes = changedFields({ sms: parsed.data }, { sms: initial });
  if (Object.keys(changes).length === 0) return { ok: true, message: "Nothing changed." };

  try {
    await connectMongoose();
    await SettingsModel.updateOne({ key: SETTINGS_KEY }, { $set: changes }, { upsert: true });
  } catch {
    return adminFail(TRY_AGAIN);
  }
  return { ok: true, message: "SMS settings saved." };
}
