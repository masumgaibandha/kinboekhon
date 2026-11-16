import type { Types } from "mongoose";

import { dhakaDay } from "@/lib/dates";
import { getImportedSpend, productDayKey } from "@/lib/meta-ads/imported-spend";
import { AdSpendModel } from "@/lib/models/AdSpend";
import { rangeFilter } from "@/lib/validation/report-range";

export interface AdSpendTotals {
  byProduct: Map<string, number>;
  // Imported Meta spend whose ad has no known product.
  unassigned: number;
}

// Imported Meta spend plus manual entries; a manual entry for a product and day that has imported spend is not counted.
export async function getAdSpendTotals(start: Date | null, end: Date | null): Promise<AdSpendTotals> {
  const day = rangeFilter(start, end);
  const [imported, manual] = await Promise.all([
    getImportedSpend(start, end),
    AdSpendModel.find(day ? { day } : {}, { day: 1, productId: 1, amountBdt: 1 }).lean<
      { day: Date; productId: Types.ObjectId; amountBdt: number }[]
    >(),
  ]);

  const byProduct = new Map<string, number>();
  const add = (productId: string, amount: number) => byProduct.set(productId, (byProduct.get(productId) ?? 0) + amount);
  for (const [key, amount] of imported.byProductDay) add(key.split("|")[0], amount);
  for (const entry of manual) {
    const productId = String(entry.productId);
    if (!imported.byProductDay.has(productDayKey(productId, dhakaDay(entry.day)))) add(productId, entry.amountBdt);
  }
  return { byProduct, unassigned: imported.unassigned };
}
