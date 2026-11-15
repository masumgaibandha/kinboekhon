import { Types } from "mongoose";

import { courierCost, returnedParcelCost } from "@/lib/courier/courier-cost";
import { OrderModel } from "@/lib/models/Order";
import { ITEMS_STAGE } from "@/lib/orders/order-items";
import type { CourierSettings } from "@/lib/validation/courier-settings";
import { rangeFilter } from "@/lib/validation/report-range";

interface ParcelGroup {
  // Pathao's own delivery fee, null for parcels not booked through the API.
  _id: { lines: { productId: Types.ObjectId; quantity: number }[]; dhakaCity: boolean; returned: boolean; pathaoFee: number | null };
  count: number;
}

// Delivered and returned parcels placed in the period, by their lines (product and quantity), area, outcome and Pathao fee.
export function parcelGroups(start: Date | null, end: Date | null) {
  const createdAt = rangeFilter(start, end);
  return OrderModel.aggregate<ParcelGroup>([
    { $match: { ...(createdAt ? { createdAt } : {}), status: { $in: ["delivered", "returned"] } } },
    ITEMS_STAGE,
    {
      $group: {
        _id: {
          lines: { $map: { input: "$items", in: { productId: "$$this.productId", quantity: "$$this.quantity" } } },
          dhakaCity: { $eq: ["$customer.location.kind", "dhaka_city"] },
          returned: { $eq: ["$status", "returned"] },
          pathaoFee: { $ifNull: ["$courier.deliveryFee", null] },
        },
        count: { $sum: 1 },
      },
    },
  ]);
}

// Courier cost per product id: Pathao's real fee, else the area and weight slab rate (each line's unit weight x
// quantity, added up), plus the return fee on returns. A parcel's cost goes to the product the order was placed from.
export function courierCostByProduct(
  groups: ParcelGroup[],
  weightOf: (productId: string) => number,
  settings: CourierSettings,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const { _id, count } of groups) {
    const id = String(_id.lines[0]?.productId);
    const grams = _id.lines.reduce((sum, line) => sum + weightOf(String(line.productId)) * line.quantity, 0);
    const delivery = _id.pathaoFee ?? courierCost(settings, _id.dhakaCity, grams);
    const perParcel = _id.returned ? returnedParcelCost(settings, delivery) : delivery;
    totals.set(id, (totals.get(id) ?? 0) + perParcel * count);
  }
  return totals;
}
