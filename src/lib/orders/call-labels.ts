import type { CallOutcome } from "@/lib/orders/enums";

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  agreed_to_wait: "Agreed to wait",
  declined: "Declined",
  no_answer: "No answer",
  call_later: "Call later",
};
