import { usdToBdt } from "@/lib/ad-spend/usd-to-bdt";
import { dhakaDay, dhakaDayStart } from "@/lib/dates";
import { connectMongoose } from "@/lib/db";
import { metaAdsLink } from "@/lib/meta-ads/connection";
import { MetaAdsError, fetchAdInsights } from "@/lib/meta-ads/graph-insights";
import { AdInsightModel } from "@/lib/models/AdInsight";
import { MetaAdsSyncModel, type SyncTrigger } from "@/lib/models/MetaAdsSync";
import { getAdSettings } from "@/lib/settings";
import { purchasesOf, type InsightRow } from "@/lib/validation/meta-insights";

// Today and the 7 days before it are fetched again on every sync, so late updates from Meta are caught.
export const SYNC_DAYS_BACK = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SyncResult = { ok: true; rows: number } | { ok: false; error: string };

function toBdt(row: InsightRow, usdRate: number): { usdRate: number | null; spendBdt: number } {
  if (row.account_currency === "USD") return { usdRate, spendBdt: usdToBdt(row.spend, usdRate) };
  if (row.account_currency === "BDT") return { usdRate: null, spendBdt: Math.round(row.spend) };
  throw new MetaAdsError(`Ad account currency ${row.account_currency} is not supported. Use USD or BDT.`);
}

async function saveRows(rows: InsightRow[], usdRate: number): Promise<number> {
  const writes = rows.map((row) => {
    const day = dhakaDayStart(row.date_start);
    if (!day) throw new MetaAdsError(`Meta sent a bad day: ${row.date_start}`);
    return {
      updateOne: {
        filter: { adId: row.ad_id, day },
        update: {
          $set: {
            adName: row.ad_name,
            adsetId: row.adset_id,
            adsetName: row.adset_name,
            campaignId: row.campaign_id,
            campaignName: row.campaign_name,
            currency: row.account_currency,
            spend: Math.round(row.spend * 100) / 100,
            ...toBdt(row, usdRate),
            impressions: row.impressions,
            linkClicks: row.inline_link_clicks,
            purchases: purchasesOf(row),
          },
        },
        upsert: true,
      },
    };
  });
  if (writes.length > 0) await AdInsightModel.bulkWrite(writes, { ordered: false });
  return writes.length;
}

async function logSync(trigger: SyncTrigger, result: SyncResult, at: Date) {
  const fields = result.ok ? { ok: true, rows: result.rows, error: "" } : { ok: false, rows: 0, error: result.error };
  await MetaAdsSyncModel.updateOne({ key: "main" }, { $set: { at, trigger, ...fields } }, { upsert: true });
}

// Imports ad-level insights for the recent days and upserts one row per ad per day. Read only on Meta's side.
export async function syncMetaInsights(trigger: SyncTrigger, now = new Date()): Promise<SyncResult> {
  const link = metaAdsLink();
  if (!link.connected) return { ok: false, error: `Meta Ads not connected. ${link.reason}` };

  await connectMongoose();
  let result: SyncResult;
  try {
    const { usdRate } = await getAdSettings();
    const since = dhakaDay(new Date(now.getTime() - SYNC_DAYS_BACK * DAY_MS));
    const rows = await fetchAdInsights(link.connection, since, dhakaDay(now));
    result = { ok: true, rows: await saveRows(rows, usdRate) };
  } catch (error) {
    const known = error instanceof MetaAdsError;
    result = { ok: false, error: known ? error.message : "Meta could not be reached. Try again later." };
  }
  await logSync(trigger, result, now);
  return result;
}
