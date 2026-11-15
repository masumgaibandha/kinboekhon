import { CheckHistoryButton } from "@/components/admin/fraud/CheckHistoryButton";
import { HistoryRows } from "@/components/admin/fraud/HistoryRows";
import { ManualHistoryForm } from "@/components/admin/fraud/ManualHistoryForm";
import { RiskBadge } from "@/components/admin/fraud/RiskBadge";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import type { DeliveryHistory } from "@/lib/fraud/delivery-history";
import { failPercent } from "@/lib/fraud/risk";

interface DeliveryHistoryCardProps {
  history: DeliveryHistory;
  orderNumber: string;
  // This order's delivery charge, asked in advance from a High risk customer.
  deliveryCharge: number;
  formKey: string;
}

// Courier delivery history of the order's phone. It only informs: nothing here changes the order.
export function DeliveryHistoryCard({ history, orderNumber, deliveryCharge, formKey }: DeliveryHistoryCardProps) {
  const { counts, risk } = history;
  const manual = history.rows.find((row) => row.source === "manual");

  return (
    <OrderCard title="Delivery history" action={<RiskBadge risk={risk ?? "unknown"} />}>
      {risk === "high" && (
        <div className="mb-3 rounded-lg border border-brand bg-brand-light p-3 text-sm text-body">
          <p className="font-semibold text-brand-dark">
            Ask delivery charge in advance: <Money amount={deliveryCharge} />
          </p>
          <p className="mt-0.5 text-desc">Many cancelled or returned parcels. Ask for it before confirming.</p>
        </div>
      )}
      <p className="text-sm text-body">
        {counts ? (
          <>
            All sources: <strong>{counts.delivered}</strong> delivered, <strong>{counts.failed}</strong> cancelled or
            returned, <strong>{counts.delivered + counts.failed}</strong> total ({failPercent(counts)}% failed).
          </>
        ) : (
          <span className="text-muted">No delivery history yet: Unknown.</span>
        )}
      </p>
      <HistoryRows rows={history.rows} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CheckHistoryButton orderNumber={orderNumber} disabled={!history.anyConnected} />
        <p className="text-xs text-muted">
          {history.anyConnected
            ? `A result is kept for 24 hours${history.nextCheckAt ? `, next check after ${formatDhakaDateTime(history.nextCheckAt)}` : ""}.`
            : "No courier connected yet. Add the Steadfast API keys to check automatically."}
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-line" open={!history.anyConnected && !manual}>
        <summary className="px-3 py-2 text-sm font-medium text-body">
          {manual ? "Replace manual entry" : "Add manual entry"}
        </summary>
        <div className="border-t border-line p-3">
          <ManualHistoryForm key={formKey} orderNumber={orderNumber} />
        </div>
      </details>
    </OrderCard>
  );
}
