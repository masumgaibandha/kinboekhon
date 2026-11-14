import Link from "next/link";

import { PERIOD_LABELS, PERIODS, type Period } from "@/lib/validation/dashboard-period";

export function PeriodSwitch({ current }: { current: Period }) {
  return (
    <nav aria-label="Period" className="flex flex-wrap gap-2">
      {PERIODS.map((period) => {
        const active = period === current;
        return (
          <Link
            key={period}
            href={period === "today" ? "/admin" : `/admin?period=${period}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              active ? "border-brand bg-brand text-white" : "border-line-strong bg-card text-body hover:border-brand"
            }`}
          >
            {PERIOD_LABELS[period]}
          </Link>
        );
      })}
    </nav>
  );
}
