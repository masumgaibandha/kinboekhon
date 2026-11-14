import type { ProductCosts } from "@/lib/validation/costs";

export function landedCost(costs: ProductCosts): number {
  return costs.chinaPrice + (costs.weightGrams / 1000) * costs.shippingPerKg + costs.agentFee;
}

// Profit per order placed: returned orders earn nothing but still pay courier, packaging and ads.
export function profitPerOrder(price: number, costs: ProductCosts): number {
  const kept = 1 - costs.returnPercent / 100;
  const codCharge = (price * costs.codPercent) / 100;
  return kept * (price - codCharge - landedCost(costs)) - costs.courier - costs.packaging - costs.adCost;
}

// Lowest price ending in 90 that reaches the target profit; NaN when no price can.
export function suggestedPrice(costs: ProductCosts): number {
  const kept = 1 - costs.returnPercent / 100;
  const priceShare = 1 - costs.codPercent / 100;
  if (kept <= 0 || priceShare <= 0) return NaN;
  const fixed = costs.targetProfit + costs.courier + costs.packaging + costs.adCost;
  const exact = (fixed / kept + landedCost(costs)) / priceShare;
  return Math.max(90, Math.ceil((exact - 90) / 100 - 1e-9) * 100 + 90);
}
