import { CallQueue } from "@/components/admin/dashboard/CallQueue";
import { PeriodSwitch } from "@/components/admin/dashboard/PeriodSwitch";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import type { CallQueueItem, CallResults, CallTodo } from "@/lib/orders/call-stats";
import { CALL_OUTCOMES } from "@/lib/orders/enums";
import type { Period } from "@/lib/validation/dashboard-period";

interface CallsCardProps {
  todo: Record<CallTodo, number>;
  results: CallResults;
  queue: CallQueueItem[];
  period: Period;
  hrefOf: (period: Period) => string;
  now: Date;
}

const TODO_LABELS: Record<CallTodo, string> = { none: "Not called yet", no_answer: "No answer", call_later: "Call later" };

const subheading = "text-sm font-semibold text-body";

export function CallsCard({ todo, results, queue, period, hrefOf, now }: CallsCardProps) {
  return (
    <section className="space-y-4 rounded-xl border border-line bg-card p-4">
      <h2 className="font-semibold text-heading">Calls</h2>

      <div className="space-y-2">
        <h3 className={subheading}>To do now (pending orders)</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(TODO_LABELS) as CallTodo[]).map((key) => (
            <StatCard key={key} label={TODO_LABELS[key]} href={`/admin/orders?status=pending&call=${key}`}>
              {todo[key]}
            </StatCard>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={subheading}>Call results</h3>
          <PeriodSwitch current={period} label="Call results period" hrefOf={hrefOf} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Calls made">{results.calls}</StatCard>
          {CALL_OUTCOMES.map((outcome) => (
            <StatCard key={outcome} label={CALL_OUTCOME_LABELS[outcome]}>
              {results.byOutcome[outcome]}
            </StatCard>
          ))}
          <StatCard label={`Confirm rate (${results.ordersCalled} called)`}>
            {results.confirmRate === null ? "-" : `${results.confirmRate}%`}
          </StatCard>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className={subheading}>Oldest pending orders to call</h3>
        <CallQueue orders={queue} now={now} />
      </div>
    </section>
  );
}
