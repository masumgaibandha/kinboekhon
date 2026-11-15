import Link from "next/link";
import type { ReactNode } from "react";

import { SignedMoney } from "@/components/admin/profit/SignedMoney";
import { Money } from "@/components/ui/Money";
import { formatRoas } from "@/lib/profit/profit-math";
import type { ProfitReport } from "@/lib/profit/profit-report";

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-heading">{children}</dd>
    </div>
  );
}

export function ProfitSummaryCard({ report, href }: { report: ProfitReport; href: string }) {
  const { total } = report;
  const above = report.rows.filter((row) => row.aboveMaxCpa).length;

  return (
    <section className="space-y-3 rounded-xl border border-line bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-heading">Ad spend &amp; profit</h2>
        <Link href={href} className="text-sm font-medium text-brand-dark hover:underline">
          Open report
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Figure label="Ad spend">
          <Money amount={total.adSpend} bold />
        </Figure>
        <Figure label="Revenue (delivered)">
          <Money amount={total.revenue} bold />
        </Figure>
        <Figure label="Net profit">
          <SignedMoney amount={total.netProfit} bold />
        </Figure>
        <Figure label="ROAS">{formatRoas(total.roas)}</Figure>
      </dl>
      {above > 0 && (
        <p className="rounded-lg bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark">
          {above} {above === 1 ? "product is" : "products are"} above max CPA.
        </p>
      )}
    </section>
  );
}
