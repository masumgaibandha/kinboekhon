import { formatBanglaDateTime } from "@/lib/bangla-date";
import type { OrderStatus } from "@/lib/orders/enums";
import type { TrackedOrder } from "@/lib/orders/order-status";

interface Step {
  status: OrderStatus;
  label: string;
}

const RANK: Record<OrderStatus, number> = { pending: 0, confirmed: 1, shipped: 2, delivered: 3, returned: 3, cancelled: -1 };

function stepsFor(status: OrderStatus): Step[] {
  return [
    { status: "pending", label: "অর্ডার পেয়েছি" },
    { status: "confirmed", label: "কনফার্ম হয়েছে" },
    { status: "shipped", label: "কুরিয়ারে দেওয়া হয়েছে" },
    status === "returned" ? { status: "returned", label: "ফেরত এসেছে" } : { status: "delivered", label: "ডেলিভারি হয়েছে" },
  ];
}

export function TrackTimeline({ order }: { order: TrackedOrder }) {
  const cancelled = order.status === "cancelled";
  // A cancelled order shows the steps it reached before it was cancelled.
  const done = (step: Step, index: number) => (cancelled ? Boolean(order.reachedAt[step.status]) : RANK[order.status] >= index);

  return (
    <ol className="space-y-0">
      {stepsFor(order.status).map((step, index, steps) => {
        const reached = done(step, index);
        const at = reached ? order.reachedAt[step.status] : undefined;
        const last = index === steps.length - 1;
        return (
          <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute top-6 bottom-0 left-[11px] w-0.5 ${reached && done(steps[index + 1], index + 1) ? "bg-brand" : "bg-line-strong"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                reached ? "border-brand bg-brand text-white" : "border-line-strong bg-card"
              }`}
            >
              {reached && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="size-3.5">
                  <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`font-semibold leading-snug ${reached ? "text-heading" : "text-muted"}`}>
                {step.label}
                <span className="sr-only">{reached ? " (হয়েছে)" : " (এখনও হয়নি)"}</span>
              </p>
              {at && <p className="mt-0.5 text-sm text-desc">{formatBanglaDateTime(at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
