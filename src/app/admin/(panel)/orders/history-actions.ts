"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { saveManualHistory } from "@/lib/fraud/manual-entry";
import { FRAUD_PROVIDERS } from "@/lib/fraud/providers";
import { checkPhoneHistory } from "@/lib/fraud/run-check";
import { OrderModel } from "@/lib/models/Order";
import { ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import { deliveryCheckSchema, manualHistorySchema } from "@/lib/validation/delivery-history";

const CHECK_FAILED = "ফ্রড চেক করা যায়নি. Try again later.";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "");

// The phone is always read from the order, never taken from the form.
async function orderPhone(orderNumber: string): Promise<string | null> {
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { "customer.phone": 1 }).lean<{ customer: { phone: string } }>();
  return order?.customer.phone ?? null;
}

function checkMessage({ checked, cached, failed }: { checked: number; cached: number; failed: number }): AdminActionResult {
  if (failed > 0 && checked === 0 && cached === 0) return adminFail(CHECK_FAILED);
  if (checked > 0) return { ok: true, message: failed > 0 ? "Checked, but one source failed." : "Delivery history checked." };
  return { ok: true, message: "Already checked in the last 24 hours. Showing the saved result." };
}

export async function checkDeliveryHistory(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = deliveryCheckSchema.safeParse({ orderNumber: text(formData, "orderNumber") });
  if (!parsed.success) return zodFail(parsed.error);
  if (!FRAUD_PROVIDERS.some((provider) => provider.connected())) return adminFail("No courier is connected yet.");
  try {
    const phone = await orderPhone(parsed.data.orderNumber);
    if (!phone) return adminFail(ORDER_NOT_FOUND);
    const result = checkMessage(await checkPhoneHistory(phone));
    revalidatePath("/admin", "layout");
    return result;
  } catch {
    return adminFail(CHECK_FAILED);
  }
}

export async function saveManualDeliveryHistory(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = manualHistorySchema.safeParse({
    orderNumber: text(formData, "orderNumber"),
    delivered: text(formData, "delivered"),
    failed: text(formData, "failed"),
    pathaoRating: text(formData, "pathaoRating"),
    note: text(formData, "note"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { orderNumber, ...entry } = parsed.data;
  try {
    const phone = await orderPhone(orderNumber);
    if (!phone) return adminFail(ORDER_NOT_FOUND);
    await saveManualHistory(phone, entry);
  } catch {
    return adminFail(TRY_AGAIN);
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Manual entry saved." };
}
