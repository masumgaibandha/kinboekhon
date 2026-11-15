"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import { addCustomerNote, saveCustomerTags } from "@/lib/customers/edit-customer-record";
import { customerNoteSchema, customerTagsSchema } from "@/lib/validation/customer";

// Runs a write and turns a database error into a message; after a change every admin page is fresh.
async function run(write: () => Promise<AdminActionResult>): Promise<AdminActionResult> {
  try {
    const result = await write();
    if (result.ok) revalidatePath("/admin", "layout");
    return result;
  } catch {
    return adminFail(TRY_AGAIN);
  }
}

export async function updateCustomerTags(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = customerTagsSchema.safeParse({
    phone: String(formData.get("phone") ?? ""),
    tags: formData.getAll("tags").map(String),
    initial: formData.getAll(INITIAL_VALUES_FIELD).map(String),
  });
  if (!parsed.success) return zodFail(parsed.error);
  return run(() => saveCustomerTags(parsed.data));
}

export async function saveCustomerNote(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = customerNoteSchema.safeParse({
    phone: String(formData.get("phone") ?? ""),
    text: String(formData.get("text") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { phone, text } = parsed.data;
  return run(() => addCustomerNote(phone, text));
}
