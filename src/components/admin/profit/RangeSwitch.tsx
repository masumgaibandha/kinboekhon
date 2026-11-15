import Form from "next/form";
import Link from "next/link";

import { RANGE_LABELS, RANGE_PERIODS, rangeHref, type RangePeriod, type ReportRange } from "@/lib/validation/report-range";

interface RangeSwitchProps {
  path: string;
  range: ReportRange;
  fallback: RangePeriod;
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand";

export function RangeSwitch({ path, range, fallback }: RangeSwitchProps) {
  return (
    <div className="space-y-3">
      <nav aria-label="Period" className="flex flex-wrap gap-2">
        {RANGE_PERIODS.map((period) => {
          const active = period === range.period;
          return (
            <Link
              key={period}
              href={rangeHref(path, period, fallback)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                active ? "border-brand bg-brand text-white" : "border-line-strong bg-card text-body hover:border-brand"
              }`}
            >
              {RANGE_LABELS[period]}
            </Link>
          );
        })}
      </nav>
      {range.period === "custom" && (
        // Keyed on the range, so the inputs show the days of the URL after every apply.
        <Form
          key={`${range.from}_${range.to}`}
          action={path}
          scroll={false}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4"
        >
          <input type="hidden" name="period" value="custom" />
          <div>
            <label htmlFor="range-from" className="block text-xs font-medium text-desc">
              From
            </label>
            <input id="range-from" name="from" type="date" defaultValue={range.from} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="range-to" className="block text-xs font-medium text-desc">
              To
            </label>
            <input id="range-to" name="to" type="date" defaultValue={range.to} className={fieldClass} />
          </div>
          <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
            Apply
          </button>
          <p className="w-full text-xs text-muted">Both days are included. Leave a side empty for no limit.</p>
        </Form>
      )}
    </div>
  );
}
