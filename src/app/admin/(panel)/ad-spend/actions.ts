"use server";

import { revalidatePath } from "next/cache";

import { AD_SPEND_GONE, createAdSpendEntry, deleteAdSpendEntry, updateAdSpendEntry } from "@/lib/ad-spend/save-ad-spend";
import { requireAdmin } from "@/lib/admin-session";
import { adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { INITIAL_VALUES_FIELD, readJsonField } from "@/lib/changed-fields";
import { adSpendIdSchema, adSpendSchema, readAdSpendForm } from "@/lib/validation/ad-spend";

// After a change the report and the dashboard card are fresh too.
function refreshed(result: AdminActionResult): AdminActionResult {
  if (result.ok) revalidatePath("/admin", "layout");
  return result;
}

const readId = (formData: FormData) => adSpendIdSchema.safeParse({ id: String(formData.get("id") ?? "") });

export async function createAdSpend(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = adSpendSchema.safeParse(readAdSpendForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  return refreshed(await createAdSpendEntry(parsed.data));
}

export async function updateAdSpend(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const id = readId(formData);
  if (!id.success) return adminFail(AD_SPEND_GONE);
  const parsed = adSpendSchema.safeParse(readAdSpendForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const initial = readJsonField(formData, INITIAL_VALUES_FIELD);
  if (!initial) return adminFail("This page is out of date. Reload it and try again.");
  return refreshed(await updateAdSpendEntry(id.data.id, parsed.data, initial));
}

export async function deleteAdSpend(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const id = readId(formData);
  if (!id.success) return adminFail(AD_SPEND_GONE);
  return refreshed(await deleteAdSpendEntry(id.data.id));
}
