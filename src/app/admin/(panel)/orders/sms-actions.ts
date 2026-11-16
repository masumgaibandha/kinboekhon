"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { sendManualSms } from "@/lib/sms/manual-sms";
import { manualSmsSchema } from "@/lib/validation/sms-settings";

export async function sendOrderSmsAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = manualSmsSchema.safeParse({
    orderNumber: String(formData.get("orderNumber") ?? ""),
    text: String(formData.get("text") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const result = await sendManualSms(parsed.data.orderNumber, parsed.data.text);
    revalidatePath(`/admin/orders/${parsed.data.orderNumber}`);
    return result;
  } catch {
    return adminFail(TRY_AGAIN);
  }
}
