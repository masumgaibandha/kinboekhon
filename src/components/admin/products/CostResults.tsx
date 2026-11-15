import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import { MAX_SLAB_GRAMS } from "@/lib/courier/courier-cost";
import {
  caseCourierCost,
  caseProfit,
  DELIVERY_CASES,
  landedCost,
  suggestedPrice,
  type DeliveryContext,
} from "@/lib/price-calculator";
import type { ProductCosts } from "@/lib/validation/costs";

interface CostResultsProps {
  costs: ProductCosts | null;
  price: number;
  context: DeliveryContext;
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

function ProfitCases({ costs, price, context }: { costs: ProductCosts; price: number; context: DeliveryContext }) {
  if (!(Number.isFinite(price) && price > 0)) {
    return <Row label="Profit per order" note="Enter a price above to see the 4 delivery cases">-</Row>;
  }
  const profits = DELIVERY_CASES.map((deliveryCase) => caseProfit(price, costs, context, deliveryCase));
  const worst = Math.min(...profits);
  return DELIVERY_CASES.map((deliveryCase, index) => (
    <Row
      key={deliveryCase.key}
      label={`Profit, ${deliveryCase.label}`}
      note={profits[index] === worst ? "Worst case at the current price" : undefined}
    >
      <Amount value={profits[index]} />
    </Row>
  ));
}

export function CostResults({ costs, price, context }: CostResultsProps) {
  if (!costs) {
    return (
      <div className="rounded-lg bg-brand-light px-4 py-2 sm:col-span-2">
        <p className="py-2 text-sm text-brand-dark">Fix the numbers above to see the results.</p>
      </div>
    );
  }
  const slabNote =
    costs.weightGrams > MAX_SLAB_GRAMS ? "Over 2 kg: the 2 kg rate is used, check the real rate" : "By weight slab, from Settings";

  return (
    <div aria-live="polite" className="rounded-lg bg-brand-light px-4 py-2 sm:col-span-2">
      <dl className="divide-y divide-line-strong">
        <Row label="Landed cost" note="China price + shipping by weight + agent fee">
          <Amount value={landedCost(costs)} />
        </Row>
        <Row label="Courier cost, Dhaka City" note={slabNote}>
          <Amount value={caseCourierCost(costs, context, true)} />
        </Row>
        <Row label="Courier cost, outside" note={slabNote}>
          <Amount value={caseCourierCost(costs, context, false)} />
        </Row>
        <Row label="Suggested price" note="Reaches the target profit in the worst delivery case, rounded up to end in 90">
          <Amount value={suggestedPrice(costs, context)} />
        </Row>
        <ProfitCases costs={costs} price={price} context={context} />
      </dl>
    </div>
  );
}
