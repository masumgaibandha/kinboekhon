import type { SmsStatus } from "@/lib/models/SmsLog";

const LABELS: Record<SmsStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
  not_connected: "Not connected",
  skipped: "Skipped",
};

const STYLES: Record<SmsStatus, string> = {
  sending: "bg-page text-desc",
  sent: "bg-brand text-white",
  failed: "bg-brand-dark text-white",
  not_connected: "bg-brand-light text-brand-dark",
  skipped: "bg-page text-desc",
};

export function SmsStatusBadge({ status }: { status: SmsStatus }) {
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold ${STYLES[status]}`}>{LABELS[status]}</span>;
}
