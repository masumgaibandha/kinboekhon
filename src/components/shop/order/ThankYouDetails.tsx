import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { ThankYouOrder } from "@/lib/orders/thank-you";

interface RowProps {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
  large?: boolean;
}

function Row({ label, value, strong, large }: RowProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "font-bold" : ""} ${large ? "text-lg text-body" : ""}`}>
      <dt>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

export function ThankYouDetails({ order }: { order: ThankYouOrder }) {
  return (
    <dl className="space-y-2 text-[15px] text-desc">
      <Row label="পণ্য" value={`${order.productName} × ${order.quantity}`} />
      <Row
        label={
          <>
            পণ্যের দাম (<Money amount={order.price} /> × {order.quantity})
          </>
        }
        value={<Money amount={order.subtotal} />}
      />
      <Row label="ডেলিভারি চার্জ" value="ফ্রি" />
      {order.discount > 0 && (
        <Row
          label="অগ্রিম পেমেন্ট ছাড়"
          value={
            <>
              -<Money amount={order.discount} />
            </>
          }
        />
      )}
      <div className="border-t border-dashed border-line-strong pt-2">
        <Row label="মোট" value={<Money amount={order.total} bold />} strong large />
      </div>
      {order.advanceAmount > 0 && <Row label="অগ্রিম পাঠিয়েছেন" value={<Money amount={order.advanceAmount} />} />}
      <div className="rounded-md bg-brand-light px-3 py-2 text-brand-dark">
        <Row label="ডেলিভারির সময় দেবেন" value={<Money amount={order.dueOnDelivery} bold />} strong />
      </div>
    </dl>
  );
}
