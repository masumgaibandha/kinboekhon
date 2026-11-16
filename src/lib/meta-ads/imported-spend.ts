import { dhakaDay } from "@/lib/dates";
import { getAdProducts, productOfAd } from "@/lib/meta-ads/ad-products";
import { AdInsightModel } from "@/lib/models/AdInsight";
import { rangeFilter } from "@/lib/validation/report-range";

export interface ImportedSpend {
  // "<productId>|<YYYY-MM-DD>" to taka spent on that product's ads that day.
  byProductDay: Map<string, number>;
  // Taka spent on ads with no known product.
  unassigned: number;
}

export const productDayKey = (productId: string, day: string) => `${productId}|${day}`;

// Imported Meta spend in [start, end), by product and Dhaka day.
export async function getImportedSpend(start: Date | null, end: Date | null): Promise<ImportedSpend> {
  const day = rangeFilter(start, end);
  const [rows, products] = await Promise.all([
    AdInsightModel.aggregate<{ _id: { adId: string; campaignId: string; day: Date }; amount: number }>([
      { $match: day ? { day } : {} },
      { $group: { _id: { adId: "$adId", campaignId: "$campaignId", day: "$day" }, amount: { $sum: "$spendBdt" } } },
    ]),
    getAdProducts(),
  ]);

  const byProductDay = new Map<string, number>();
  let unassigned = 0;
  for (const { _id, amount } of rows) {
    const productId = productOfAd(products, _id.adId, _id.campaignId);
    if (!productId) {
      unassigned += amount;
      continue;
    }
    const key = productDayKey(productId, dhakaDay(_id.day));
    byProductDay.set(key, (byProductDay.get(key) ?? 0) + amount);
  }
  return { byProductDay, unassigned };
}
