import { formatLocation } from "@/lib/locations/format";
import type { OrderDocument } from "@/lib/models/Order";
import { itemsLabel, orderItems, totalUnits } from "@/lib/orders/order-items";
import { DELIVERY_TYPE_NORMAL, ITEM_TYPE_PARCEL, MAX_WEIGHT_KG, MIN_WEIGHT_KG } from "@/lib/pathao/config";
import type { CourierLocation } from "@/lib/pathao/location-match";

type ParcelOrder = Pick<OrderDocument, "orderNumber" | "customer" | "items" | "product" | "quantity" | "total" | "payment">;
type PaidOrder = { total: number; payment: Pick<OrderDocument["payment"], "option" | "status" | "advanceAmount"> };

// What the courier collects: the total minus an advance we checked and approved.
export function amountToCollect(order: PaidOrder): number {
  const paid = order.payment.status === "verified" ? order.payment.advanceAmount : 0;
  return Math.max(0, order.total - paid);
}

// The parcel weight in kg, rounded up to 0.1 kg; Pathao takes 0.5 kg at least.
export function parcelWeightKg(grams: number): number {
  return Math.max(MIN_WEIGHT_KG, Math.ceil(grams / 100) / 10);
}

export function parcelProblem(order: Pick<PaidOrder, "payment">, weightKg: number): string | null {
  if (order.payment.option !== "cod" && order.payment.status !== "verified") {
    return "The advance payment is not approved. Approve it or switch to cash on delivery first.";
  }
  if (weightKg > MAX_WEIGHT_KG) return `The parcel weighs ${weightKg} kg. Pathao takes up to ${MAX_WEIGHT_KG} kg.`;
  return null;
}

// The Pathao create order body. Our order number is the merchant order id.
export function parcelBody(order: ParcelOrder, location: CourierLocation, storeId: number, weightKg: number) {
  const items = orderItems(order);
  return {
    store_id: storeId,
    merchant_order_id: order.orderNumber,
    recipient_name: order.customer.name,
    recipient_phone: order.customer.phone,
    recipient_address: `${order.customer.address}, ${formatLocation(order.customer.location)}`.slice(0, 220),
    recipient_city: location.cityId,
    recipient_zone: location.zoneId,
    ...(location.areaId && { recipient_area: location.areaId }),
    delivery_type: DELIVERY_TYPE_NORMAL,
    item_type: ITEM_TYPE_PARCEL,
    item_quantity: totalUnits(items),
    item_weight: weightKg,
    item_description: itemsLabel(items).slice(0, 200),
    amount_to_collect: amountToCollect(order),
  };
}
