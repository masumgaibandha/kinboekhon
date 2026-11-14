"use server";

import { refresh } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { TRY_AGAIN, adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { INITIAL_VALUES_FIELD, readJsonField } from "@/lib/changed-fields";
import { changeOrderStatus, saveOrderNote } from "@/lib/orders/change-status";
import { editOrderCustomer } from "@/lib/orders/edit-customer";
import { switchToCashOnDelivery } from "@/lib/orders/payment-review";
import {
  adminNoteSchema,
  customerEditSchema,
  customerFieldsSchema,
  statusChangeSchema,
  switchToCodSchema,
} from "@/lib/validation/admin-order";

const RELOAD = "Reload the page and try again.";

const reader = (formData: FormData) => (name: string) => String(formData.get(name) ?? "");

// Runs a write, turns a database error into a message and refreshes the page after a change.
async function run(write: () => Promise<AdminActionResult>): Promise<AdminActionResult> {
  try {
    const result = await write();
    if (result.ok) refresh();
    return result;
  } catch {
    return adminFail(TRY_AGAIN);
  }
}

export async function updateOrderStatus(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const text = reader(formData);
  const parsed = statusChangeSchema.safeParse({
    orderNumber: text("orderNumber"),
    from: text("from"),
    to: text("to"),
    note: text("note"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  return run(() => changeOrderStatus(parsed.data));
}

export async function saveAdminNote(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const text = reader(formData);
  const parsed = adminNoteSchema.safeParse({
    orderNumber: text("orderNumber"),
    note: text("adminNote"),
    initial: formData.get(INITIAL_VALUES_FIELD) ?? undefined,
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { orderNumber, note, initial } = parsed.data;
  return run(() => saveOrderNote(orderNumber, note, initial));
}

export async function updateOrderCustomer(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const initial = customerFieldsSchema.safeParse(readJsonField(formData, INITIAL_VALUES_FIELD));
  if (!initial.success) return adminFail(RELOAD);

  const text = reader(formData);
  const parsed = customerEditSchema.safeParse({
    orderNumber: text("orderNumber"),
    name: text("name"),
    phone: text("phone"),
    address: text("address"),
    divisionId: text("divisionId"),
    districtId: text("districtId"),
    upazilaId: text("upazilaId"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  return run(() => editOrderCustomer(parsed.data, initial.data));
}

export async function switchOrderToCod(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const text = reader(formData);
  const parsed = switchToCodSchema.safeParse({ orderNumber: text("orderNumber"), note: text("note") });
  if (!parsed.success) return zodFail(parsed.error);
  const { orderNumber, note } = parsed.data;
  return run(() => switchToCashOnDelivery(orderNumber, note));
}
