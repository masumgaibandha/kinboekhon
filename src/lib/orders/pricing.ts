import type { PaymentOption } from "@/lib/orders/enums";

export interface OrderAmounts {
  subtotal: number;
  discount: number;
  total: number;
  advanceAmount: number;
  dueOnDelivery: number;
}

// The one place order money is calculated: the live summary and the saved order both use it.
// Delivery is free (built into the price); only full advance payment gets a discount.
export function calculateOrder(
  price: number,
  quantity: number,
  option: PaymentOption = "cod",
  fullAdvanceDiscount = 0,
): OrderAmounts {
  const subtotal = price * quantity;
  // The discount never makes the total negative.
  const discount = option === "advance_full" ? Math.min(fullAdvanceDiscount, subtotal) : 0;
  const total = subtotal - discount;
  const advanceAmount = option === "advance_full" ? total : 0;
  return { subtotal, discount, total, advanceAmount, dueOnDelivery: total - advanceAmount };
}
