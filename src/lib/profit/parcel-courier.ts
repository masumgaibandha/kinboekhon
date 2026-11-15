import { Types } from "mongoose";

import { courierCost, returnedParcelCost } from "@/lib/courier/courier-cost";
import { OrderModel } from "@/lib/models/Order";
import type { CourierSettings } from "@/lib/validation/courier-settings";
import { rangeFilter } from "@/lib/validation/report-range";

interface ParcelGroup {
  _id: { productId: Types.ObjectId; dhakaCity: boolean; quantity: number; returned: boolean };
  count: number;
}

// Delivered and returned parcels placed in the period, by product, area, quantity and outcome.
export function parcelGroups(start: Date | null, end: Date | null) {
  const createdAt = rangeFilter(start, end);
  return OrderModel.aggregate<ParcelGroup>([
    { $match: { ...(createdAt ? { createdAt } : {}), status: { $in: ["delivered", "returned"] } } },
    {
      $group: {
        _id: {
          productId: "$product.productId",
          dhakaCity: { $eq: ["$customer.location.kind", "dhaka_city"] },
          quantity: "$quantity",
          returned: { $eq: ["$status", "returned"] },
        },
        count: { $sum: 1 },
      },
    },
  ]);
}

// Courier cost per product id: the area and weight slab rate (unit weight x quantity), plus the return fee on returns.
export function courierCostByProduct(
  groups: ParcelGroup[],
  weightOf: (productId: string) => number,
  settings: CourierSettings,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const { _id, count } of groups) {
    const id = String(_id.productId);
    const delivery = courierCost(settings, _id.dhakaCity, weightOf(id) * _id.quantity);
    const perParcel = _id.returned ? returnedParcelCost(settings, delivery) : delivery;
    totals.set(id, (totals.get(id) ?? 0) + perParcel * count);
  }
  return totals;
}
