import Link from "next/link";

import { TagBadges } from "@/components/admin/customers/TagBadges";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { returnRate } from "@/lib/customers/customer-stats";
import type { CustomerSummary } from "@/lib/customers/customer-summary";

// The customer's record at a glance on an order page.
export function CustomerSummaryCard({ summary }: { summary: CustomerSummary }) {
  const rows = [
    ["Past orders", String(summary.pastOrders)],
    ["Delivered", String(summary.stats.delivered)],
    ["Return rate", returnRate(summary.stats)],
  ] as const;

  return (
    <OrderCard
      title="Customer record"
      action={
        summary.hasRecord && (
          <Link href={`/admin/customers/${summary.phone}`} className="text-sm font-medium text-brand-dark hover:underline">
            Open customer
          </Link>
        )
      }
    >
      <dl className="grid grid-cols-3 gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-muted">{label}</dt>
            <dd className="text-lg font-bold text-heading">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 text-sm">
        {summary.tags.length > 0 ? <TagBadges tags={summary.tags} /> : <span className="text-muted">No tags</span>}
      </div>
    </OrderCard>
  );
}
