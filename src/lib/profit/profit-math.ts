import { landedCost } from "@/lib/price-calculator";
import type { ProductCosts } from "@/lib/validation/costs";

// Order numbers of one product for orders placed in the period.
export interface OrderCounts {
  orders: number;
  confirmed: number;
  delivered: number;
  returned: number;
  revenue: number;
  deliveredQuantity: number;
  // What the courier collected in cash on delivered orders.
  codCollected: number;
}

export interface ProfitNumbers extends OrderCounts {
  adSpend: number;
  costPerOrder: number | null;
  costPerConfirmed: number | null;
  productCost: number;
  courierCost: number;
  packagingCost: number;
  codCost: number;
  netProfit: number;
  roas: number | null;
}

export interface ProfitRow extends ProfitNumbers {
  productId: string;
  name: string;
  aboveMaxCpa: boolean;
}

export const NO_ORDERS: OrderCounts = { orders: 0, confirmed: 0, delivered: 0, returned: 0, revenue: 0, deliveredQuantity: 0, codCollected: 0 };

export const formatRoas = (roas: number | null) => (roas === null ? "-" : `${roas.toFixed(2)}x`);

const perUnit = (amount: number, count: number) => (count === 0 ? null : Math.round(amount / count));
const roasOf = (revenue: number, adSpend: number) => (adSpend === 0 ? null : Math.round((revenue / adSpend) * 100) / 100);

function withRatios(numbers: Omit<ProfitNumbers, "costPerOrder" | "costPerConfirmed" | "netProfit" | "roas">): ProfitNumbers {
  const { adSpend, revenue, productCost, courierCost, packagingCost, codCost } = numbers;
  return {
    ...numbers,
    costPerOrder: perUnit(adSpend, numbers.orders),
    costPerConfirmed: perUnit(adSpend, numbers.confirmed),
    netProfit: revenue - productCost - courierCost - packagingCost - codCost - adSpend,
    roas: roasOf(revenue, adSpend),
  };
}

// Delivered orders cost the landed product and the COD charge on the cash collected; delivered and returned
// parcels both paid courier and packaging.
export function profitRow(
  product: { productId: string; name: string },
  counts: OrderCounts,
  adSpend: number,
  costs: ProductCosts,
  maxCpa: number,
  codPercent: number,
): ProfitRow {
  const shipped = counts.delivered + counts.returned;
  const numbers = withRatios({
    ...counts,
    adSpend,
    productCost: Math.round(landedCost(costs) * counts.deliveredQuantity),
    courierCost: Math.round(costs.courier * shipped),
    packagingCost: Math.round(costs.packaging * shipped),
    codCost: Math.round((counts.codCollected * codPercent) / 100),
  });
  const aboveMaxCpa = adSpend > 0 && (numbers.costPerConfirmed === null || numbers.costPerConfirmed > maxCpa);
  return { ...product, ...numbers, aboveMaxCpa };
}

export function totalOf(rows: ProfitRow[]): ProfitNumbers {
  const sum = (key: keyof OrderCounts | "adSpend" | "productCost" | "courierCost" | "packagingCost" | "codCost") =>
    rows.reduce((total, row) => total + row[key], 0);
  return withRatios({
    orders: sum("orders"),
    confirmed: sum("confirmed"),
    delivered: sum("delivered"),
    returned: sum("returned"),
    revenue: sum("revenue"),
    deliveredQuantity: sum("deliveredQuantity"),
    codCollected: sum("codCollected"),
    adSpend: sum("adSpend"),
    productCost: sum("productCost"),
    courierCost: sum("courierCost"),
    packagingCost: sum("packagingCost"),
    codCost: sum("codCost"),
  });
}
