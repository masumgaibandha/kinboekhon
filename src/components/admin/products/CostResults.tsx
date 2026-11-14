import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import { landedCost, profitPerOrder, suggestedPrice } from "@/lib/price-calculator";
import type { ProductCosts } from "@/lib/validation/costs";

interface CostResultsProps {
  costs: ProductCosts | null;
  price: number;
}

function Amount({ value }: { value: number }) {
  if (!Number.isFinite(value)) return <span>-</span>;
  const rounded = Math.round(value);
  return (
    <span className={rounded < 0 ? "text-brand-dark" : "text-heading"}>
      {rounded < 0 && "-"}
      <Money amount={Math.abs(rounded)} bold />
    </span>
  );
}

function Row({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt>
        <span className="font-medium text-body">{label}</span>
        {note && <span className="block text-sm text-desc">{note}</span>}
      </dt>
      <dd className="text-lg font-bold">{children}</dd>
    </div>
  );
}

export function CostResults({ costs, price }: CostResultsProps) {
  const hasPrice = Number.isFinite(price) && price > 0;

  return (
    <div aria-live="polite" className="rounded-lg bg-brand-light px-4 py-2 sm:col-span-2">
      {costs ? (
        <dl className="divide-y divide-line-strong">
          <Row label="Landed cost" note="China price + shipping by weight + agent fee">
            <Amount value={landedCost(costs)} />
          </Row>
          <Row label="Suggested price" note="Reaches the target profit, rounded up to end in 90">
            <Amount value={suggestedPrice(costs)} />
          </Row>
          <Row label="Profit per order" note={hasPrice ? "At the current price" : "Enter a price above to see it"}>
            {hasPrice ? <Amount value={profitPerOrder(price, costs)} /> : <span>-</span>}
          </Row>
        </dl>
      ) : (
        <p className="py-2 text-sm text-brand-dark">Fix the numbers above to see the results.</p>
      )}
    </div>
  );
}
