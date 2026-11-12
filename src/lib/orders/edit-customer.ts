import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { formatLocation } from "@/lib/locations/format";
import type { OrderLocation } from "@/lib/locations/types";
import { OrderModel } from "@/lib/models/Order";
import { missOrStale, ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import type { OrderStatus } from "@/lib/orders/enums";
import { DELIVERY_AREA_ADMIN_LABELS, type DeliveryArea } from "@/lib/orders/limits";
import { calculateOrder, deliveryChargesFrom } from "@/lib/orders/pricing";
import { CUSTOMER_EDITABLE_STATUSES, canEditCustomer } from "@/lib/orders/status";
import { getSettings } from "@/lib/settings";
import type { CustomerEdit, CustomerFields } from "@/lib/validation/admin-order";

interface EditDoc {
  status: OrderStatus;
  quantity: number;
  product: { price: number };
  deliveryArea: DeliveryArea;
  deliveryCharge: number;
  total: number;
  customer: { name: string; phone: string; address: string; location: OrderLocation };
}

const LOCATION_KEYS = ["deliveryArea", "cityCorporation", "divisionId", "districtId", "upazilaId"] as const;
const money = (amount: number) => amount.toLocaleString("en-IN");

// The stored location ids the form was loaded with, so a stale form cannot overwrite a newer location.
function locationGuard(initial: CustomerFields): Record<string, string> {
  if (initial.deliveryArea === "inside_dhaka") {
    return { deliveryArea: initial.deliveryArea, "customer.location.cityCorporation": initial.cityCorporation };
  }
  return {
    deliveryArea: initial.deliveryArea,
    "customer.location.divisionId": initial.divisionId,
    "customer.location.districtId": initial.districtId,
    "customer.location.upazilaId": initial.upazilaId,
  };
}

// Writes only the fields the admin changed, and only while they still hold the values the form was loaded with.
export async function editOrderCustomer(edit: CustomerEdit, initial: CustomerFields): Promise<AdminActionResult> {
  const changed = {
    name: edit.name !== initial.name,
    phone: edit.phone !== initial.phone,
    address: edit.address !== initial.address,
    location: LOCATION_KEYS.some((key) => edit[key] !== initial[key]),
    area: edit.deliveryArea !== initial.deliveryArea,
  };
  if (!Object.values(changed).some(Boolean)) return adminFail("Nothing changed.");

  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber: edit.orderNumber }).lean<EditDoc>();
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (!canEditCustomer(order.status)) {
    return adminFail("Customer details can be edited only while the order is pending or confirmed.");
  }

  const guard: Record<string, unknown> = { orderNumber: edit.orderNumber, status: { $in: CUSTOMER_EDITABLE_STATUSES } };
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
    set.deliveryArea = edit.deliveryArea;
    notes.push(`Location: ${formatLocation(order.customer.location)} to ${formatLocation(edit.location)}`);
  }

  if (changed.area) {
    // The new charge comes from the current Settings, like a new order.
    const charge = deliveryChargesFrom(await getSettings())[edit.deliveryArea];
    const amounts = calculateOrder(order.product.price, order.quantity, charge);
    Object.assign(set, {
      subtotal: amounts.subtotal,
      deliveryCharge: amounts.deliveryCharge,
      deliveryDiscount: amounts.deliveryDiscount,
      total: amounts.total,
      "payment.advanceAmount": amounts.advanceAmount,
      "payment.dueOnDelivery": amounts.dueOnDelivery,
    });
    notes.push(
      `Delivery: ${DELIVERY_AREA_ADMIN_LABELS[order.deliveryArea]} to ${DELIVERY_AREA_ADMIN_LABELS[edit.deliveryArea]}, ` +
        `charge ${money(order.deliveryCharge)} to ${money(amounts.deliveryCharge)}, ` +
        `total ${money(order.total)} to ${money(amounts.total)}`,
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
  return { ok: true, message: "Customer details saved." };
}
