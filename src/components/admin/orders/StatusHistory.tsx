import { formatDhakaDateTime } from "@/lib/dates";
import type { OrderHistoryEntry } from "@/lib/models/Order";
import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import { STATUS_LABELS } from "@/lib/orders/status";

function titleOf(entry: OrderHistoryEntry & { placed: boolean }): string {
  if (entry.kind === "edit") return "Customer details edited";
  if (entry.kind === "payment") return "Payment";
  if (entry.kind === "call") return entry.outcome ? `Call: ${CALL_OUTCOME_LABELS[entry.outcome]}` : "Call";
  return entry.placed ? "Order placed" : `Status: ${STATUS_LABELS[entry.status]}`;
}

// Newest first. The first entry is the order being placed.
export function StatusHistory({ history }: { history: OrderHistoryEntry[] }) {
  const entries = history.map((entry, index) => ({ ...entry, placed: index === 0 })).reverse();

  return (
    <ol className="space-y-3 border-l-2 border-line pl-4">
      {entries.map((entry) => (
        <li key={entry.at.toISOString() + entry.kind} className="text-sm">
          <p className="font-semibold text-heading">{titleOf(entry)}</p>
          <p className="text-muted">{formatDhakaDateTime(entry.at)}</p>
          {entry.note && <p className="mt-0.5 whitespace-pre-line break-words text-desc">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}
