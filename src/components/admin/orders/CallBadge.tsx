import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import type { CallOutcome } from "@/lib/orders/enums";

// No answer and Call later still need a call, so they stand out; the others are settled.
const STYLES: Record<CallOutcome, string> = {
  no_answer: "border border-brand bg-brand-light text-brand-dark",
  call_later: "border border-brand bg-brand-light text-brand-dark",
  agreed_to_wait: "bg-line text-body",
  declined: "bg-line text-muted",
};

export function CallBadge({ outcome }: { outcome: CallOutcome }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[outcome]}`}>
      {CALL_OUTCOME_LABELS[outcome]}
    </span>
  );
}
