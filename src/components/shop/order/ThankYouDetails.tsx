import { formatTaka, toBanglaDigits } from "@/lib/money";
import { DELIVERY_AREA_LABELS } from "@/lib/orders/limits";
import type { ThankYouOrder } from "@/lib/orders/thank-you";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "text-lg font-bold text-body" : ""}`}>
      <dt>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

export function ThankYouDetails({ order }: { order: ThankYouOrder }) {
  return (
    <dl className="space-y-2 text-[15px] text-desc">
      <Row label="পণ্য" value={`${order.productName} × ${toBanglaDigits(order.quantity)}`} />
      <Row label={`পণ্যের দাম (${formatTaka(order.price)} × ${toBanglaDigits(order.quantity)})`} value={formatTaka(order.subtotal)} />
      <Row
        label={`ডেলিভারি চার্জ (${DELIVERY_AREA_LABELS[order.deliveryArea]})`}
        value={formatTaka(order.deliveryCharge)}
      />
      {order.deliveryDiscount > 0 && <Row label="ডেলিভারি ছাড়" value={`-${formatTaka(order.deliveryDiscount)}`} />}
      <div className="border-t border-dashed border-line-strong pt-2">
        <Row label="মোট" value={formatTaka(order.total)} strong />
      </div>
      {order.advanceAmount > 0 && <Row label="অগ্রিম পরিশোধ" value={formatTaka(order.advanceAmount)} />}
      <div className="rounded-md bg-brand-light px-3 py-2 text-brand-dark">
        <Row label="ডেলিভারির সময় দেবেন" value={formatTaka(order.dueOnDelivery)} strong />
      </div>
    </dl>
  );
}
