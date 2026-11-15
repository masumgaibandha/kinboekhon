"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { addStockPurchase, adjustStock, saveLowStockLevel } from "@/lib/stock/product-stock";
import { lowStockLevelSchema, stockAdjustmentSchema, stockPurchaseSchema } from "@/lib/validation/stock";

const reader = (formData: FormData) => (name: string) => String(formData.get(name) ?? "");

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

export async function addPurchase(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const text = reader(formData);
  const parsed = stockPurchaseSchema.safeParse({
    productId: text("productId"),
    quantity: text("quantity"),
    unitCost: text("unitCost"),
    note: text("note"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  return run(() => addStockPurchase(parsed.data));
}

export async function addAdjustment(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const text = reader(formData);
  const parsed = stockAdjustmentSchema.safeParse({ productId: text("productId"), change: text("change"), reason: text("reason") });
  if (!parsed.success) return zodFail(parsed.error);
  return run(() => adjustStock(parsed.data));
}

export async function updateLowStockLevel(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const text = reader(formData);
  const parsed = lowStockLevelSchema.safeParse({ productId: text("productId"), level: text("level"), initial: text("initial") });
  if (!parsed.success) return zodFail(parsed.error);
  const { productId, level, initial } = parsed.data;
  return run(() => saveLowStockLevel(productId, level, initial));
}
