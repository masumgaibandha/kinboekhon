import type { OrderStatus } from "@/lib/orders/enums";
import { STATUS_LABELS } from "@/lib/orders/status";

// Brand tokens only: open orders stand out, finished ones are quiet.
const STYLES: Record<OrderStatus, string> = {
  pending: "bg-brand text-white",
  confirmed: "bg-brand-light text-brand-dark",
  shipped: "border border-brand text-brand-dark",
  delivered: "bg-heading text-white",
  returned: "bg-line-strong text-body",
  cancelled: "bg-line text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
