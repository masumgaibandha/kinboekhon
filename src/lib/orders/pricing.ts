import { cityCorporationOf } from "@/lib/locations/dhaka";
import type { PaymentOption } from "@/lib/orders/enums";

export interface OrderAmounts {
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  advanceAmount: number;
  dueOnDelivery: number;
}

// The Settings values order money depends on.
export interface PricingSettings {
  deliveryChargeDhakaCity: number;
  deliveryChargeOutside: number;
  advanceDeliveryDiscount: number;
  fullAdvanceDiscount: number;
}

export type Discounts = Pick<PricingSettings, "advanceDeliveryDiscount" | "fullAdvanceDiscount">;

const NO_DISCOUNTS: Discounts = { advanceDeliveryDiscount: 0, fullAdvanceDiscount: 0 };

// Dhaka City is a Dhaka North or South city corporation; everything else pays the outside charge.
export function isDhakaCity(upazilaId: string): boolean {
  return cityCorporationOf(upazilaId) !== undefined;
}

export function deliveryChargeFor(dhakaCity: boolean, settings: PricingSettings): number {
  return dhakaCity ? settings.deliveryChargeDhakaCity : settings.deliveryChargeOutside;
}

// The one place order money is calculated: the live summary and the saved order both use it.
// Only one discount applies: off the delivery charge when it is paid in advance, or off the total when everything is.
export function calculateOrder(
  price: number,
  quantity: number,
  deliveryCharge: number,
  option: PaymentOption = "cod",
  discounts: Discounts = NO_DISCOUNTS,
): OrderAmounts {
  const subtotal = price * quantity;
  const full = subtotal + deliveryCharge;
  const discount =
    option === "advance_delivery"
      ? Math.min(discounts.advanceDeliveryDiscount, deliveryCharge)
      : option === "advance_full"
        ? Math.min(discounts.fullAdvanceDiscount, full)
        : 0;
  const total = full - discount;
  const advanceAmount = option === "advance_full" ? total : option === "advance_delivery" ? deliveryCharge - discount : 0;
  return { subtotal, deliveryCharge, discount, total, advanceAmount, dueOnDelivery: total - advanceAmount };
}
