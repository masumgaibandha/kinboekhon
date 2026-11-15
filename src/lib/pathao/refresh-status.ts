import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import { applyPathaoUpdate } from "@/lib/pathao/apply-update";
import { dataOf, pathaoError, pathaoRequest } from "@/lib/pathao/client";
import { NOT_CONNECTED, pathaoConfig } from "@/lib/pathao/config";
import { courierStatusLabel, statusSlug } from "@/lib/pathao/status-map";

// Pathao writes "2024-11-20 15:11:40" in Dhaka time.
function dhakaTime(value: unknown): Date | null {
  const match = typeof value === "string" ? /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/.exec(value.trim()) : null;
  if (!match) return null;
  const date = new Date(`${match[1]}T${match[2]}+06:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Asks Pathao for the parcel's status and saves it like a webhook update.
export async function refreshPathaoStatus(orderNumber: string): Promise<AdminActionResult> {
  if (!pathaoConfig()) return adminFail(NOT_CONNECTED);
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { "courier.consignmentId": 1 }).lean<{ courier?: { consignmentId?: string } }>();
  if (!order) return adminFail(ORDER_NOT_FOUND);
  const consignmentId = order.courier?.consignmentId;
  if (!consignmentId) return adminFail("This order has no Pathao consignment.");

  try {
    const response = await pathaoRequest(`/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/info`);
    const data = dataOf(response);
    const raw = data.order_status_slug ?? data.order_status;
    if (response.status !== 200 || typeof raw !== "string") return adminFail(`Pathao: ${pathaoError(response)}`);
    const slug = statusSlug(raw);
    const at = dhakaTime(data.updated_at) ?? new Date();
    const result = await applyPathaoUpdate({ consignmentId, slug, at });
    const label = courierStatusLabel(slug);
    return { ok: true, message: result === "applied" ? `Pathao status: ${label}.` : `No change. Pathao status: ${label}.` };
  } catch {
    return adminFail("Could not reach Pathao. Try again.");
  }
}
