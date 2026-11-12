import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { OrderAmounts } from "@/lib/orders/pricing";

interface OrderSummaryProps {
  price: number;
  quantity: number;
  amounts: OrderAmounts;
  areaLabel: string;
  advance: boolean;
}

function Row({ label, children, className = "" }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between gap-3 ${className}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function OrderSummary({ price, quantity, amounts, areaLabel, advance }: OrderSummaryProps) {
  return (
    <dl className="space-y-1.5 border-t border-dashed border-line-strong pt-3 text-[15px] text-desc">
      <Row
        label={
          <>
            পণ্যের দাম (<Money amount={price} /> × {quantity})
          </>
        }
      >
        <Money amount={amounts.subtotal} />
      </Row>
      <Row label={`ডেলিভারি চার্জ (${areaLabel})`}>
        <Money amount={amounts.deliveryCharge} />
      </Row>
      {amounts.deliveryDiscount > 0 && (
        <Row label="ডেলিভারি ছাড়" className="text-brand-dark">
          -<Money amount={amounts.deliveryDiscount} />
        </Row>
      )}
      <Row label="মোট" className="text-lg font-bold text-body">
        <Money amount={amounts.total} bold />
      </Row>
      {advance && (
        <>
          <Row label="এখন অগ্রিম পাঠাবেন" className="font-semibold text-body">
            <Money amount={amounts.advanceAmount} />
          </Row>
          <Row label="ডেলিভারির সময় দেবেন" className="font-semibold text-body">
            <Money amount={amounts.dueOnDelivery} />
          </Row>
        </>
      )}
    </dl>
  );
}
