"use server";

import { refresh } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { IncompleteOrderModel } from "@/lib/models/IncompleteOrder";
import { draftIdSchema } from "@/lib/validation/draft";

const GONE = "This incomplete order no longer exists. Reload the page.";

export async function markDraftContacted(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = draftIdSchema.safeParse({ id: String(formData.get("id") ?? "") });
  if (!parsed.success) return zodFail(parsed.error);

  try {
    await connectMongoose();
    // timestamps: false keeps the list order and the 30 day expiry tied to the customer's last change.
    const result = await IncompleteOrderModel.updateOne(
      { _id: parsed.data.id },
      { $set: { contactedAt: new Date() } },
      { timestamps: false },
    );
    if (result.matchedCount === 0) return adminFail(GONE);
    refresh();
    return { ok: true, message: "Marked as contacted." };
  } catch {
    return adminFail(TRY_AGAIN);
  }
}

export async function deleteIncompleteOrder(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = draftIdSchema.safeParse({ id: String(formData.get("id") ?? "") });
  if (!parsed.success) return zodFail(parsed.error);

  try {
    await connectMongoose();
    const result = await IncompleteOrderModel.deleteOne({ _id: parsed.data.id });
    if (result.deletedCount === 0) return adminFail(GONE);
    refresh();
    return { ok: true, message: "Incomplete order deleted." };
  } catch {
    return adminFail(TRY_AGAIN);
  }
}
