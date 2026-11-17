import type { HistoryStatus } from "@/lib/fraud/delivery-history";

const TEXT: Record<HistoryStatus, string> = {
  found: "Found",
  no_history: "No history",
  error: "ফ্রড চেক করা যায়নি",
  not_connected: "Not connected",
  not_checked: "Not checked",
  manual: "Entered",
};

const STYLES: Record<HistoryStatus, string> = {
  found: "bg-line text-body",
  no_history: "bg-line text-muted",
  error: "border border-brand-dark text-brand-dark",
  not_connected: "bg-line text-muted",
  not_checked: "bg-line text-muted",
  manual: "bg-line text-body",
};

export function HistoryStatusBadge({ status }: { status: HistoryStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {TEXT[status]}
    </span>
  );
}
