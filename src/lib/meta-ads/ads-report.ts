import { connectMongoose } from "@/lib/db";
import { NO_AD_NUMBERS, addNumbers, adsRow, type AdNumbers, type AdsRow } from "@/lib/meta-ads/ads-math";
import { AdInsightModel } from "@/lib/models/AdInsight";
import { OrderModel } from "@/lib/models/Order";
import { CONFIRMED_STATUSES } from "@/lib/orders/enums";
import { getAdSettings } from "@/lib/settings";
import { rangeFilter } from "@/lib/validation/report-range";

export interface AdsReport {
  campaigns: AdsRow[];
  adsets: AdsRow[];
  ads: AdsRow[];
  // The ad account currency, null before the first import.
  currency: string | null;
  maxCpa: number;
}

interface AdInfo {
  _id: string;
  adName: string;
  adsetId: string;
  adsetName: string;
  campaignId: string;
  campaignName: string;
  currency: string;
}

// Names and parents of every imported ad, from its newest day.
const adCatalog = () =>
  AdInsightModel.aggregate<AdInfo>([
    { $sort: { day: -1 } },
    {
      $group: {
        _id: "$adId",
        ...Object.fromEntries(["adName", "adsetId", "adsetName", "campaignId", "campaignName", "currency"].map((f) => [f, { $first: `$${f}` }])),
      },
    },
  ]);

function spendByAd(start: Date | null, end: Date | null) {
  const day = rangeFilter(start, end);
  return AdInsightModel.aggregate<{ _id: string; spendBdt: number; spend: number; purchases: number }>([
    { $match: day ? { day } : {} },
    { $group: { _id: "$adId", spendBdt: { $sum: "$spendBdt" }, spend: { $sum: "$spend" }, purchases: { $sum: "$purchases" } } },
  ]);
}

const count = (condition: object) => ({ $sum: { $cond: [condition, 1, 0] } });

// Orders placed in the period whose utm_content is a known ad id.
function ordersByAd(start: Date | null, end: Date | null, adIds: string[]) {
  const createdAt = rangeFilter(start, end);
  return OrderModel.aggregate<{ _id: string; orders: number; confirmed: number; delivered: number; returned: number; deliveredRevenue: number }>([
    { $match: { ...(createdAt ? { createdAt } : {}), "tracking.utmContent": { $in: adIds } } },
    {
      $group: {
        _id: "$tracking.utmContent",
        orders: { $sum: 1 },
        confirmed: count({ $in: ["$status", CONFIRMED_STATUSES] }),
        delivered: count({ $eq: ["$status", "delivered"] }),
        returned: count({ $eq: ["$status", "returned"] }),
        deliveredRevenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$total", 0] } },
      },
    },
  ]);
}

const bySpend = (a: AdsRow, b: AdsRow) => b.spendBdt - a.spendBdt || b.orders - a.orders;

// Spend and our orders per campaign, ad set and ad for [start, end); orders are matched to ads by ad id.
export async function getAdsReport(start: Date | null, end: Date | null): Promise<AdsReport> {
  await connectMongoose();
  const [catalog, spendRows, { maxCpa }] = await Promise.all([adCatalog(), spendByAd(start, end), getAdSettings()]);
  const info = new Map(catalog.map((ad) => [ad._id, ad]));
  const orderRows = await ordersByAd(start, end, [...info.keys()]);

  const numbers = new Map<string, AdNumbers>();
  const add = (id: string, part: Partial<AdNumbers>) => numbers.set(id, addNumbers(numbers.get(id) ?? NO_AD_NUMBERS, { ...NO_AD_NUMBERS, ...part }));
  for (const { _id, ...part } of spendRows) add(_id, part);
  for (const { _id, ...part } of orderRows) add(_id, part);

  const adsets = new Map<string, { info: AdInfo; numbers: AdNumbers }>();
  const campaigns = new Map<string, { info: AdInfo; numbers: AdNumbers }>();
  const ads: AdsRow[] = [];
  for (const [adId, adNumbers] of numbers) {
    const ad = info.get(adId);
    if (!ad) continue;
    ads.push(adsRow({ id: adId, name: ad.adName, parent: ad.adsetName, campaignId: ad.campaignId }, adNumbers, maxCpa));
    for (const [groups, key] of [[adsets, ad.adsetId], [campaigns, ad.campaignId]] as const) {
      const group = groups.get(key);
      groups.set(key, { info: group?.info ?? ad, numbers: addNumbers(group?.numbers ?? NO_AD_NUMBERS, adNumbers) });
    }
  }

  const campaignRows = [...campaigns].map(([id, { info: ad, numbers: sum }]) =>
    adsRow({ id, name: ad.campaignName, parent: "", campaignId: id }, sum, maxCpa),
  );
  const adsetRows = [...adsets].map(([id, { info: ad, numbers: sum }]) =>
    adsRow({ id, name: ad.adsetName, parent: ad.campaignName, campaignId: ad.campaignId }, sum, maxCpa),
  );
  return {
    campaigns: campaignRows.sort(bySpend),
    adsets: adsetRows.sort(bySpend),
    ads: ads.sort(bySpend),
    currency: catalog[0]?.currency ?? null,
    maxCpa,
  };
}
