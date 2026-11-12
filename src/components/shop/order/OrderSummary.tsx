import { formatTaka, toBanglaDigits } from "@/lib/money";

interface OrderSummaryProps {
  price: number;
  quantity: number;
  deliveryCharge: number;
  areaLabel: string;
}

export function OrderSummary({ price, quantity, deliveryCharge, areaLabel }: OrderSummaryProps) {
  const subtotal = price * quantity;

  return (
    <dl className="space-y-1.5 border-t border-dashed border-line-strong pt-3 text-[15px] text-desc">
      <div className="flex justify-between gap-3">
        <dt>
          পণ্যের দাম ({formatTaka(price)} × {toBanglaDigits(quantity)})
        </dt>
        <dd>{formatTaka(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt>ডেলিভারি চার্জ ({areaLabel})</dt>
        <dd>{formatTaka(deliveryCharge)}</dd>
      </div>
      <div className="flex justify-between gap-3 text-lg font-bold text-body">
        <dt>মোট</dt>
        <dd>{formatTaka(subtotal + deliveryCharge)}</dd>
      </div>
    </dl>
  );
}
