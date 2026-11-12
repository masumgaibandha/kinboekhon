import { formatTaka, toBanglaDigits } from "@/lib/money";
import { calculateOrder } from "@/lib/orders/pricing";

interface OrderSummaryProps {
  price: number;
  quantity: number;
  deliveryCharge: number;
  areaLabel: string;
}

export function OrderSummary({ price, quantity, deliveryCharge, areaLabel }: OrderSummaryProps) {
  const amounts = calculateOrder(price, quantity, deliveryCharge);

  return (
    <dl className="space-y-1.5 border-t border-dashed border-line-strong pt-3 text-[15px] text-desc">
      <div className="flex justify-between gap-3">
        <dt>
          পণ্যের দাম ({formatTaka(price)} × {toBanglaDigits(quantity)})
        </dt>
        <dd>{formatTaka(amounts.subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt>ডেলিভারি চার্জ ({areaLabel})</dt>
        <dd>{formatTaka(amounts.deliveryCharge)}</dd>
      </div>
      <div className="flex justify-between gap-3 text-lg font-bold text-body">
        <dt>মোট</dt>
        <dd>{formatTaka(amounts.total)}</dd>
      </div>
    </dl>
  );
}
