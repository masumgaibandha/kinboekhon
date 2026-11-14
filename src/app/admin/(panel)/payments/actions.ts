"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { approvePayment, rejectPayment } from "@/lib/orders/payment-review";
import { paymentReviewSchema } from "@/lib/validation/admin-order";

export async function reviewPayment(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = paymentReviewSchema.safeParse({
    orderNumber: String(formData.get("orderNumber") ?? ""),
    decision: String(formData.get("decision") ?? ""),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);

  const { orderNumber, decision, note } = parsed.data;
  try {
    const result = decision === "approve" ? await approvePayment(orderNumber, note) : await rejectPayment(orderNumber, note);
    // Also drops the admin pages the browser kept, so the dashboard and orders list are fresh.
    if (result.ok) revalidatePath("/admin", "layout");
    return result;
  } catch {
    return adminFail(TRY_AGAIN);
  }
}
