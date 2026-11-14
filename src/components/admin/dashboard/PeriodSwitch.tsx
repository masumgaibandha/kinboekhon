import Link from "next/link";

import { PERIOD_LABELS, PERIODS, type Period } from "@/lib/validation/dashboard-period";

interface PeriodSwitchProps {
  current: Period;
  label: string;
  hrefOf: (period: Period) => string;
}

export function PeriodSwitch({ current, label, hrefOf }: PeriodSwitchProps) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {PERIODS.map((period) => {
        const active = period === current;
        return (
          <Link
            key={period}
            href={hrefOf(period)}
            scroll={false}
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
