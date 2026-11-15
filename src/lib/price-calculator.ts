import type { ProductCosts } from "@/lib/validation/costs";

export function landedCost(costs: ProductCosts): number {
  return costs.chinaPrice + (costs.weightGrams / 1000) * costs.shippingPerKg + costs.agentFee;
}

// Profit per order placed from the product price alone: returned orders earn nothing but still pay packaging and ads.
// The customer pays the delivery charge, so the courier is counted on its own line (deliveryMargin).
export function profitPerOrder(price: number, costs: ProductCosts): number {
  const kept = 1 - costs.returnPercent / 100;
  const codCharge = (price * costs.codPercent) / 100;
  return kept * (price - codCharge - landedCost(costs)) - costs.packaging - costs.adCost;
}

// What the delivery charge of a delivered parcel leaves after paying the courier.
export function deliveryMargin(deliveryCharge: number, costs: ProductCosts): number {
  return deliveryCharge - costs.courier;
}

// Lowest price ending in 90 that reaches the target profit; NaN when no price can.
export function suggestedPrice(costs: ProductCosts): number {
  const kept = 1 - costs.returnPercent / 100;
  const priceShare = 1 - costs.codPercent / 100;
  if (kept <= 0 || priceShare <= 0) return NaN;
  const fixed = costs.targetProfit + costs.packaging + costs.adCost;
  const exact = (fixed / kept + landedCost(costs)) / priceShare;
  return Math.max(90, Math.ceil((exact - 90) / 100 - 1e-9) * 100 + 90);
}
