import type { Metadata } from "next";
import Link from "next/link";

import { AdSpendForm } from "@/components/admin/ad-spend/AdSpendForm";
import { AdSpendTable } from "@/components/admin/ad-spend/AdSpendTable";
import { RangeSwitch } from "@/components/admin/profit/RangeSwitch";
import { listAdSpend, productChoices } from "@/lib/ad-spend/ad-spend-entries";
import { requireAdmin } from "@/lib/admin-session";
import { dhakaDay } from "@/lib/dates";
import { getAdSettings } from "@/lib/settings";
import { readReportRange } from "@/lib/validation/report-range";

export const metadata: Metadata = { title: "Ad spend" };

export const instant = false;

export default async function AdSpendPage({ searchParams }: PageProps<"/admin/ad-spend">) {
  await requireAdmin();
  const now = new Date();
  const range = readReportRange(await searchParams, "month", now);
  const [entries, products, ads] = await Promise.all([listAdSpend(range.start, range.end), productChoices(), getAdSettings()]);
  const today = dhakaDay(now);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Ad spend</h1>
        <Link href="/admin/profit" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark">
          Profit report
        </Link>
      </div>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="text-lg font-semibold text-heading">Add ad spend</h2>
        <p className="mt-1 text-sm text-desc">One entry per product per day. The taka amount is saved with the entry.</p>
        <div className="mt-4">
          <AdSpendForm
            products={products}
            today={today}
            start={{ day: today, productId: "", amountUsd: "", usdRate: String(ads.usdRate) }}
          />
        </div>
      </section>

      <RangeSwitch path="/admin/ad-spend" range={range} fallback="month" />
      <AdSpendTable entries={entries} />
    </div>
  );
}
