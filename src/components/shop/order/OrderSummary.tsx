import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { PaymentOption } from "@/lib/orders/enums";
import type { OrderAmounts } from "@/lib/orders/pricing";

interface OrderSummaryProps {
  price: number;
  quantity: number;
  amounts: OrderAmounts;
  option: PaymentOption;
  // Null until the customer picks the upazila, thana or city corporation.
  dhakaCity: boolean | null;
  charges: { dhakaCity: number; outside: number };
}

const DISCOUNT_LABELS: Record<PaymentOption, string> = {
  advance_delivery: "ডেলিভারি চার্জে ছাড়",
  advance_full: "পুরো টাকা অগ্রিমে ছাড়",
  cod: "ছাড়",
};

function Row({ label, children, className = "" }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between gap-3 ${className}`}>
      <dt>{label}</dt>
      <dd className="whitespace-nowrap">{children}</dd>
    </div>
  );
}

export function OrderSummary({ price, quantity, amounts, option, dhakaCity, charges }: OrderSummaryProps) {
  const area = dhakaCity === null ? "" : dhakaCity ? " (ঢাকা সিটি)" : " (ঢাকা সিটির বাইরে)";

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
      <Row label={`ডেলিভারি চার্জ${area}`}>
        <Money amount={amounts.deliveryCharge} />
      </Row>
      {dhakaCity === null && (
        <p className="text-sm text-muted">
          ঢাকা সিটি <Money amount={charges.dhakaCity} />, ঢাকা সিটির বাইরে <Money amount={charges.outside} />। এলাকা বেছে
          নিলে ঠিক চার্জ দেখাবে।
        </p>
      )}
      {amounts.discount > 0 && (
        <Row label={DISCOUNT_LABELS[option]} className="text-brand-dark">
          -<Money amount={amounts.discount} />
        </Row>
      )}
      <Row label="মোট" className="text-lg font-bold text-body">
        <Money amount={amounts.total} bold />
      </Row>
      <div className="mt-2 space-y-1.5 rounded-md bg-brand-light px-3 py-2 font-semibold text-body">
        <Row label="এখন অগ্রিম পাঠাবেন">
          <Money amount={amounts.advanceAmount} />
        </Row>
        <Row label="ডেলিভারির সময় দেবেন">
          <Money amount={amounts.dueOnDelivery} />
        </Row>
      </div>
    </dl>
  );
}
