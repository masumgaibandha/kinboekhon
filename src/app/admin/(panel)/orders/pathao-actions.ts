"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { clearUnclearSend } from "@/lib/pathao/clear-send";
import { getPathaoAreas, getPathaoZones, type PathaoPlace } from "@/lib/pathao/places";
import { refreshPathaoStatus } from "@/lib/pathao/refresh-status";
import { saveCourierLocation } from "@/lib/pathao/save-location";
import { sendOrderToPathao } from "@/lib/pathao/send-order";
import { pathaoBulkSchema, pathaoLocationSchema, pathaoOrderSchema, placeIdSchema } from "@/lib/validation/pathao";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "");

// Runs a Pathao write; any change re-renders the admin pages.
async function run(write: () => Promise<AdminActionResult>): Promise<AdminActionResult> {
  try {
    const result = await write();
    revalidatePath("/admin", "layout");
    return result;
  } catch {
    return adminFail(TRY_AGAIN);
  }
}

function orderAction(write: (orderNumber: string) => Promise<AdminActionResult>) {
  return async (formData: FormData): Promise<AdminActionResult> => {
    const parsed = pathaoOrderSchema.safeParse({ orderNumber: text(formData, "orderNumber") });
    if (!parsed.success) return zodFail(parsed.error);
    return run(() => write(parsed.data.orderNumber));
  };
}

export async function sendToPathao(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  return orderAction(sendOrderToPathao)(formData);
}

export async function refreshPathao(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  return orderAction(refreshPathaoStatus)(formData);
}

export async function clearPathaoSend(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  return orderAction(clearUnclearSend)(formData);
}

// Sends the ticked orders one by one; each is checked and locked on its own.
export async function bulkSendToPathao(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = pathaoBulkSchema.safeParse({ orderNumbers: formData.getAll("orderNumbers").map(String) });
  if (!parsed.success) return adminFail(parsed.error.issues[0].message);
  return run(async () => {
    const failures: string[] = [];
    let sent = 0;
    for (const orderNumber of new Set(parsed.data.orderNumbers)) {
      const result = await sendOrderToPathao(orderNumber).catch(() => adminFail(TRY_AGAIN));
      if (result.ok) sent++;
      else failures.push(`${orderNumber}: ${result.message}`);
    }
    const summary = `Sent ${sent} ${sent === 1 ? "order" : "orders"} to Pathao.`;
    if (failures.length === 0) return { ok: true, message: summary };
    return sent > 0 ? { ok: true, warning: true, message: `${summary} Not sent: ${failures.join(" ")}` } : adminFail(`Not sent: ${failures.join(" ")}`);
  });
}

export async function savePathaoLocation(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = pathaoLocationSchema.safeParse({
    orderNumber: text(formData, "orderNumber"),
    cityId: text(formData, "cityId"),
    zoneId: text(formData, "zoneId"),
    areaId: text(formData, "areaId"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { orderNumber, ...picked } = parsed.data;
  return run(() => saveCourierLocation(orderNumber, picked));
}

// Lists for the location form; read from the cache, fetched from Pathao when old.
export async function loadPathaoZones(cityId: number): Promise<PathaoPlace[]> {
  await requireAdmin();
  const parsed = placeIdSchema.safeParse(cityId);
  return parsed.success ? getPathaoZones(parsed.data) : [];
}

export async function loadPathaoAreas(zoneId: number): Promise<PathaoPlace[]> {
  await requireAdmin();
  const parsed = placeIdSchema.safeParse(zoneId);
  return parsed.success ? getPathaoAreas(parsed.data) : [];
}
