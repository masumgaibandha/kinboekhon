export interface AdNumbers {
  spendBdt: number;
  // Spend in the ad account currency.
  spend: number;
  purchases: number;
  orders: number;
  confirmed: number;
  delivered: number;
  returned: number;
  deliveredRevenue: number;
}

export interface AdsRow extends AdNumbers {
  id: string;
  name: string;
  // Campaign name for an ad set, ad set name for an ad, "" for a campaign.
  parent: string;
  campaignId: string;
  costPerConfirmed: number | null;
  costPerDelivered: number | null;
  roas: number | null;
  considerPausing: boolean;
}

export const NO_AD_NUMBERS: AdNumbers = {
  spendBdt: 0,
  spend: 0,
  purchases: 0,
  orders: 0,
  confirmed: 0,
  delivered: 0,
  returned: 0,
  deliveredRevenue: 0,
};

export function addNumbers(a: AdNumbers, b: AdNumbers): AdNumbers {
  return {
    spendBdt: a.spendBdt + b.spendBdt,
    spend: Math.round((a.spend + b.spend) * 100) / 100,
    purchases: a.purchases + b.purchases,
    orders: a.orders + b.orders,
    confirmed: a.confirmed + b.confirmed,
    delivered: a.delivered + b.delivered,
    returned: a.returned + b.returned,
    deliveredRevenue: a.deliveredRevenue + b.deliveredRevenue,
  };
}

const perUnit = (amount: number, count: number) => (count === 0 ? null : Math.round(amount / count));

// "Consider pausing": spent at least twice the max CPA and not one confirmed order.
export function adsRow(
  base: { id: string; name: string; parent: string; campaignId: string },
  numbers: AdNumbers,
  maxCpa: number,
): AdsRow {
  return {
    ...base,
    ...numbers,
    costPerConfirmed: perUnit(numbers.spendBdt, numbers.confirmed),
    costPerDelivered: perUnit(numbers.spendBdt, numbers.delivered),
    roas: numbers.spendBdt === 0 ? null : Math.round((numbers.deliveredRevenue / numbers.spendBdt) * 100) / 100,
    considerPausing: numbers.spendBdt > 0 && numbers.spendBdt >= 2 * maxCpa && numbers.confirmed === 0,
  };
}
