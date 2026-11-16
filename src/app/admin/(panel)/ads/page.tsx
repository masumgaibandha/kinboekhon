import type { Metadata } from "next";
import Link from "next/link";

import { AdsTable } from "@/components/admin/ads/AdsTable";
import { CampaignProductForm } from "@/components/admin/ads/CampaignProductForm";
import { SyncStatus } from "@/components/admin/ads/SyncStatus";
import { UrlParamsBox } from "@/components/admin/ads/UrlParamsBox";
import { RangeSwitch } from "@/components/admin/profit/RangeSwitch";
import { Money } from "@/components/ui/Money";
import { requireAdmin } from "@/lib/admin-session";
import { getAdsReport } from "@/lib/meta-ads/ads-report";
import { getCampaignProducts } from "@/lib/meta-ads/campaign-products";
import { metaAdsLink } from "@/lib/meta-ads/connection";
import { getLastSync } from "@/lib/meta-ads/last-sync";
import { productChoices } from "@/lib/products";
import { readReportRange } from "@/lib/validation/report-range";

export const metadata: Metadata = { title: "Meta Ads" };

export const instant = false;

// Sync now waits for Meta's reply.
export const maxDuration = 60;

export default async function AdsPage({ searchParams }: PageProps<"/admin/ads">) {
  await requireAdmin();
  const range = readReportRange(await searchParams, "week", new Date());
  const [report, lastSync, campaignProducts, products] = await Promise.all([
    getAdsReport(range.start, range.end),
    getLastSync(),
    getCampaignProducts(),
    productChoices(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Meta Ads</h1>
        <Link href="/admin/profit" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark">
          Profit report
        </Link>
      </div>

      <SyncStatus link={metaAdsLink()} lastSync={lastSync} />
      <UrlParamsBox />
      <RangeSwitch path="/admin/ads" range={range} fallback="week" />

      <AdsTable
        title="Campaigns"
        rows={report.campaigns}
        currency={report.currency}
        extra={{
          title: "Product",
          cell: (row) => {
            const chosen = campaignProducts.get(row.id);
            return <CampaignProductForm key={chosen?.version ?? "none"} campaignId={row.id} productId={chosen?.productId ?? ""} products={products} />;
          },
        }}
      />
      <AdsTable title="Ad sets" rows={report.adsets} currency={report.currency} />
      <AdsTable title="Ads" rows={report.ads} currency={report.currency} />

      <div className="space-y-1 text-sm text-desc">
        <p>
          Spend and Meta purchases come from Meta by day. Our orders are orders placed in the period whose utm_content is the ad
          id. Confirmed counts orders now confirmed, shipped, delivered or returned. Real ROAS is the total of delivered orders
          divided by spend. A USD account is turned into taka with the Settings dollar rate when it is imported.
        </p>
        <p>
          Consider pausing: spend of at least twice the max CPA (<Money amount={report.maxCpa} />) with no confirmed order.
        </p>
        <p>
          The profit report counts each ad&apos;s spend for the product most of its orders were placed from; an ad with no
          orders uses its campaign&apos;s Product above. A manual ad spend entry for a product and day that already has
          imported spend is not counted.
        </p>
      </div>
    </div>
  );
}
