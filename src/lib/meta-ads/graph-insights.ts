import { GRAPH_URL } from "@/lib/meta/capi";
import type { MetaAdsConnection } from "@/lib/meta-ads/connection";
import { graphErrorSchema, insightPageSchema, type InsightRow } from "@/lib/validation/meta-insights";

const TIMEOUT_MS = 20000;
const MAX_PAGES = 40;
const FIELDS = [
  "campaign_id",
  "campaign_name",
  "adset_id",
  "adset_name",
  "ad_id",
  "ad_name",
  "spend",
  "impressions",
  "inline_link_clicks",
  "actions",
  "account_currency",
].join(",");

export class MetaAdsError extends Error {}

// Only GET requests: this client never writes to the ad account.
async function getPage(url: string, token: string): Promise<{ rows: InsightRow[]; next?: string }> {
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const graphError = graphErrorSchema.safeParse(json);
    throw new MetaAdsError(`Meta: ${graphError.success ? graphError.data.error.message.slice(0, 300) : `HTTP ${response.status}`}`);
  }
  const page = insightPageSchema.safeParse(json);
  if (!page.success) throw new MetaAdsError("Meta: the insights reply was not in the expected shape.");
  return { rows: page.data.data, next: page.data.paging?.next };
}

// Ad-level insights, one row per ad per day, for the days `since` to `until` ("YYYY-MM-DD", both included).
export async function fetchAdInsights(connection: MetaAdsConnection, since: string, until: string): Promise<InsightRow[]> {
  const params = new URLSearchParams({
    level: "ad",
    time_increment: "1",
    time_range: JSON.stringify({ since, until }),
    fields: FIELDS,
    use_unified_attribution_setting: "true",
    limit: "500",
  });
  let url: string | undefined = `${GRAPH_URL}/${connection.accountId}/insights?${params}`;
  const rows: InsightRow[] = [];
  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    const result = await getPage(url, connection.token);
    rows.push(...result.rows);
    // Paging links must stay on the Graph API host, so the token is never sent anywhere else.
    url = result.next?.startsWith("https://graph.facebook.com/") ? result.next : undefined;
  }
  return rows;
}
