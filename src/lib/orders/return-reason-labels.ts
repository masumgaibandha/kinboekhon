import type { ReturnReason } from "@/lib/orders/enums";

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  refused: "Refused",
  unreachable: "Unreachable",
  wrong_address: "Wrong address",
  courier_delay: "Courier delay",
  damaged: "Damaged",
  wrong_item: "Wrong item",
  fake_order: "Fake order",
};
