import { courierCost, returnedParcelCost } from "@/lib/courier/courier-cost";
import type { ProductCosts } from "@/lib/validation/costs";
import type { CourierSettings } from "@/lib/validation/courier-settings";

// Delivery charges from Settings and the real courier cost.
export interface DeliveryContext {
  dhakaCity: number;
  outside: number;
  advanceDiscount: number;
  courier: CourierSettings;
}

export interface DeliveryCase {
  key: string;
  label: string;
  dhakaCity: boolean;
  advance: boolean;
}

export const DELIVERY_CASES: DeliveryCase[] = [
  { key: "dhaka-cod", label: "Dhaka City, cash on delivery", dhakaCity: true, advance: false },
  { key: "dhaka-advance", label: "Dhaka City, delivery charge in advance", dhakaCity: true, advance: true },
  { key: "outside-cod", label: "Outside, cash on delivery", dhakaCity: false, advance: false },
  { key: "outside-advance", label: "Outside, delivery charge in advance", dhakaCity: false, advance: true },
];

export function landedCost(costs: ProductCosts): number {
  return costs.chinaPrice + (costs.weightGrams / 1000) * costs.shippingPerKg + costs.agentFee;
}

export function caseCourierCost(costs: ProductCosts, context: DeliveryContext, dhakaCity: boolean): number {
  return courierCost(context.courier, dhakaCity, costs.weightGrams);
}

// Profit per order placed. A delivered order earns the price and the delivery charge (less the advance discount),
// minus the COD charge on the cash collected, the landed cost and the courier. A returned order earns nothing and
// pays the courier plus the return fee. Every order pays packaging and ads.
export function caseProfit(price: number, costs: ProductCosts, context: DeliveryContext, deliveryCase: DeliveryCase): number {
  const kept = 1 - costs.returnPercent / 100;
  const fullCharge = deliveryCase.dhakaCity ? context.dhakaCity : context.outside;
  const charge = deliveryCase.advance ? Math.max(0, fullCharge - context.advanceDiscount) : fullCharge;
  const collected = deliveryCase.advance ? price : price + charge;
  const courier = caseCourierCost(costs, context, deliveryCase.dhakaCity);
  const delivered = price + charge - (collected * context.courier.codPercent) / 100 - landedCost(costs) - courier;
  const returned = returnedParcelCost(context.courier, courier);
  return kept * delivered - (1 - kept) * returned - costs.packaging - costs.adCost;
}

// Lowest price ending in 90 that reaches the target profit in every delivery case; NaN when no price can.
export function suggestedPrice(costs: ProductCosts, context: DeliveryContext): number {
  // Each extra taka of price adds this much profit in every case.
  const slope = (1 - costs.returnPercent / 100) * (1 - context.courier.codPercent / 100);
  if (slope <= 0) return NaN;
  const exact = Math.max(
    ...DELIVERY_CASES.map((deliveryCase) => (costs.targetProfit - caseProfit(0, costs, context, deliveryCase)) / slope),
  );
  return Math.max(90, Math.ceil((exact - 90) / 100 - 1e-9) * 100 + 90);
}
