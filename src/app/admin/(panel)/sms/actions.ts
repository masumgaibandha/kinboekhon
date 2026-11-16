"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { sendTestSms } from "@/lib/sms/test-sms";
import { testSmsSchema } from "@/lib/validation/sms-settings";

export async function sendTestSmsAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = testSmsSchema.safeParse({ phone: String(formData.get("phone") ?? "") });
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const result = await sendTestSms(parsed.data.phone);
    revalidatePath("/admin/sms");
    return result;
  } catch {
    return adminFail(TRY_AGAIN);
  }
}
