import type { Metadata } from "next";
import Link from "next/link";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { ProfitTable } from "@/components/admin/profit/ProfitTable";
import { RangeSwitch } from "@/components/admin/profit/RangeSwitch";
import { SignedMoney } from "@/components/admin/profit/SignedMoney";
import { Money } from "@/components/ui/Money";
import { requireAdmin } from "@/lib/admin-session";
import { formatRoas } from "@/lib/profit/profit-math";
import { getProfitReport } from "@/lib/profit/profit-report";
import { readReportRange } from "@/lib/validation/report-range";

export const metadata: Metadata = { title: "Profit report" };

export const instant = false;

export default async function ProfitPage({ searchParams }: PageProps<"/admin/profit">) {
  await requireAdmin();
  const range = readReportRange(await searchParams, "today", new Date());
  const { rows, total, maxCpa } = await getProfitReport(range.start, range.end);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Profit report</h1>
        <Link href="/admin/ad-spend" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark">
          Ad spend entries
        </Link>
      </div>

      <RangeSwitch path="/admin/profit" range={range} fallback="today" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Ad spend">
          <Money amount={total.adSpend} bold />
        </StatCard>
        <StatCard label="Revenue (delivered)">
          <Money amount={total.revenue} bold />
        </StatCard>
        <StatCard label="Net profit">
          <SignedMoney amount={total.netProfit} bold />
        </StatCard>
        <StatCard label="ROAS">{formatRoas(total.roas)}</StatCard>
      </div>

      <ProfitTable rows={rows} total={total} />

      <div className="space-y-1 text-sm text-desc">
        <p>
          Orders count by the day they were placed, ad spend by its date. Confirmed counts orders now confirmed, shipped,
          delivered or returned. Revenue counts delivered orders only.
        </p>
        <p>
          Costs come from each product&apos;s price calculator: landed product cost for delivered items, courier and
          packaging for delivered and returned parcels.
        </p>
        <p>
          Rows with ad spend and a cost per confirmed order above the max CPA (<Money amount={maxCpa} />) are highlighted.{" "}
          <Link href="/admin/settings" className="font-medium text-brand-dark hover:underline">
            Change it in Settings
          </Link>
        </p>
      </div>
    </div>
  );
}
