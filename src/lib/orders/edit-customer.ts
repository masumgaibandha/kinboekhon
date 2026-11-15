import { FIX_FIELDS, adminFail, type AdminActionResult } from "@/lib/admin-result";
import { syncCustomer } from "@/lib/customers/sync-customer";
import { connectMongoose } from "@/lib/db";
import { cityCorporationOf } from "@/lib/locations/dhaka";
import { formatLocation } from "@/lib/locations/format";
import type { OrderLocation } from "@/lib/locations/types";
import { OrderModel } from "@/lib/models/Order";
import { missOrStale, ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import type { OrderStatus, PaymentOption } from "@/lib/orders/enums";
import { calculateOrder, deliveryChargeFor } from "@/lib/orders/pricing";
import { CUSTOMER_EDITABLE_STATUSES, canEditCustomer } from "@/lib/orders/status";
import { getSettings } from "@/lib/settings";
import type { CustomerEdit, CustomerFields } from "@/lib/validation/admin-order";

interface EditDoc {
  status: OrderStatus;
  quantity: number;
  product: { price: number };
  deliveryCharge?: number;
  total: number;
  payment: { option: PaymentOption };
  customer: { name: string; phone: string; address: string; location: OrderLocation };
}

const LOCATION_KEYS = ["divisionId", "districtId", "upazilaId"] as const;
const money = (amount: number) => amount.toLocaleString("en-IN");
const areaName = (location: OrderLocation) => (location.kind === "dhaka_city" ? "Dhaka City" : "outside Dhaka City");

export const AREA_LOCKED =
  "Dhaka City and outside have different delivery charges, and the customer paid in advance for this one. Cancel the order and place a new one instead.";

// The stored location ids the form was loaded with, so a stale form cannot overwrite a newer location.
function locationGuard(initial: CustomerFields): Record<string, string> {
  const last = cityCorporationOf(initial.upazilaId) ? "cityCorporation" : "upazilaId";
  return {
    "customer.location.divisionId": initial.divisionId,
    "customer.location.districtId": initial.districtId,
    [`customer.location.${last}`]: initial.upazilaId,
  };
}

// Writes only the fields the admin changed, and only while they still hold the values the form was loaded with.
export async function editOrderCustomer(edit: CustomerEdit, initial: CustomerFields): Promise<AdminActionResult> {
  const changed = {
    name: edit.name !== initial.name,
    phone: edit.phone !== initial.phone,
    address: edit.address !== initial.address,
    location: LOCATION_KEYS.some((key) => edit[key] !== initial[key]),
  };
  if (!Object.values(changed).some(Boolean)) return adminFail("Nothing changed.");

  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber: edit.orderNumber }).lean<EditDoc>();
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (!canEditCustomer(order.status)) {
    return adminFail("Customer details can be edited only while the order is pending or confirmed.");
  }
  const areaChanged = changed.location && edit.location.kind !== order.customer.location.kind;
  if (areaChanged && order.payment.option !== "cod") return adminFail(FIX_FIELDS, { upazilaId: AREA_LOCKED });

  const guard: Record<string, unknown> = { orderNumber: edit.orderNumber, status: { $in: CUSTOMER_EDITABLE_STATUSES } };
  // The amounts are worked out as cash on delivery, so the option must not have changed meanwhile.
  if (areaChanged) guard["payment.option"] = "cod";
  const set: Record<string, unknown> = {};
  const notes: string[] = [];

  for (const field of ["name", "phone", "address"] as const) {
    if (!changed[field]) continue;
    guard[`customer.${field}`] = initial[field];
    set[`customer.${field}`] = edit[field];
    notes.push(`${field[0].toUpperCase()}${field.slice(1)}: "${order.customer[field]}" to "${edit[field]}"`);
  }

  if (changed.location) {
    Object.assign(guard, locationGuard(initial));
    set["customer.location"] = edit.location;
    notes.push(`Location: ${formatLocation(order.customer.location)} to ${formatLocation(edit.location)}`);
  }

  if (areaChanged) {
    // The new charge comes from the current Settings, like a new order.
    const charge = deliveryChargeFor(edit.location.kind === "dhaka_city", await getSettings());
    const amounts = calculateOrder(order.product.price, order.quantity, charge);
    Object.assign(set, {
      deliveryCharge: amounts.deliveryCharge,
      discount: amounts.discount,
      total: amounts.total,
      "payment.advanceAmount": amounts.advanceAmount,
      "payment.dueOnDelivery": amounts.dueOnDelivery,
    });
    notes.push(
      `Delivery: ${areaName(order.customer.location)} to ${areaName(edit.location)}, ` +
        `charge ${money(order.deliveryCharge ?? 0)} to ${money(charge)}, total ${money(order.total)} to ${money(amounts.total)}`,
    );
  }

  const updated = await OrderModel.findOneAndUpdate(
    guard,
    {
      $set: set,
      $push: { statusHistory: { kind: "edit", status: order.status, at: new Date(), note: notes.join("; ") } },
    },
    { projection: { _id: 1 } },
  ).lean();
  if (!updated) return missOrStale(edit.orderNumber);

  // The edit is saved; a failed customer record refresh must not turn it into an error.
  try {
    await syncCustomer(edit.phone);
    if (changed.phone) await syncCustomer(order.customer.phone);
  } catch {}
  return { ok: true, message: "Customer details saved." };
}
