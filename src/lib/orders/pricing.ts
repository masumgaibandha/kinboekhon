import type { PaymentOption } from "@/lib/orders/enums";
import type { DeliveryArea } from "@/lib/orders/limits";
import type { Settings } from "@/lib/validation/settings";

export type DeliveryCharges = Record<DeliveryArea, number>;
export type DeliveryDiscounts = Record<Exclude<PaymentOption, "cod">, number>;

export interface OrderAmounts {
  subtotal: number;
  deliveryCharge: number;
  deliveryDiscount: number;
  total: number;
  advanceAmount: number;
  dueOnDelivery: number;
}

const NO_DISCOUNTS: DeliveryDiscounts = { advance_delivery: 0, advance_full: 0 };

export function deliveryChargesFrom(settings: Settings): DeliveryCharges {
  return {
    inside_dhaka: settings.deliveryChargeInsideDhaka,
    outside_dhaka: settings.deliveryChargeOutsideDhaka,
  };
}

export function deliveryDiscountsFrom(settings: Settings): DeliveryDiscounts {
  return { advance_delivery: settings.advanceDeliveryDiscount, advance_full: settings.fullAdvanceDiscount };
}

// The one place order money is calculated: the live summary and the saved order both use it.
export function calculateOrder(
  price: number,
  quantity: number,
  deliveryCharge: number,
  option: PaymentOption = "cod",
  discounts: DeliveryDiscounts = NO_DISCOUNTS,
): OrderAmounts {
  const subtotal = price * quantity;
  // The discount never makes the delivery charge negative.
  const deliveryDiscount = option === "cod" ? 0 : Math.min(discounts[option], deliveryCharge);
  const total = subtotal + deliveryCharge - deliveryDiscount;
  const advanceAmount =
    option === "advance_full" ? total : option === "advance_delivery" ? deliveryCharge - deliveryDiscount : 0;
  return { subtotal, deliveryCharge, deliveryDiscount, total, advanceAmount, dueOnDelivery: total - advanceAmount };
}
