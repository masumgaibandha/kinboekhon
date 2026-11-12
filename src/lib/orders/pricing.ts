import type { DeliveryArea } from "@/lib/orders/limits";
import type { Settings } from "@/lib/validation/settings";

export type DeliveryCharges = Record<DeliveryArea, number>;

export interface OrderAmounts {
  subtotal: number;
  deliveryCharge: number;
  deliveryDiscount: number;
  total: number;
  advanceAmount: number;
  dueOnDelivery: number;
}

export function deliveryChargesFrom(settings: Settings): DeliveryCharges {
  return {
    inside_dhaka: settings.deliveryChargeInsideDhaka,
    outside_dhaka: settings.deliveryChargeOutsideDhaka,
  };
}

// The one place order money is calculated: the live summary and the saved order both use it.
export function calculateOrder(price: number, quantity: number, deliveryCharge: number): OrderAmounts {
  const subtotal = price * quantity;
  const total = subtotal + deliveryCharge;
  return { subtotal, deliveryCharge, deliveryDiscount: 0, total, advanceAmount: 0, dueOnDelivery: total };
}
