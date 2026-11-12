import Link from "next/link";
import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { AdminOrder } from "@/lib/orders/admin-order-detail";
import { DELIVERY_AREA_ADMIN_LABELS } from "@/lib/orders/limits";

const PAYMENT_LABELS: Record<AdminOrder["paymentOption"], string> = {
  cod: "Cash on delivery",
  advance_delivery: "Delivery charge in advance",
  advance_full: "Full amount in advance",
};

function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${strong ? "font-semibold text-heading" : "text-body"}`}>
      <dt>{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function OrderAmounts({ order }: { order: AdminOrder }) {
  return (
    <div className="space-y-3 text-sm">
      <p>
        <Link href={`/p/${order.product.slug}`} className="font-semibold text-heading hover:text-brand hover:underline">
          {order.product.name}
        </Link>
      </p>
      <dl className="divide-y divide-line">
        <Row label={`Price x ${order.quantity}`}>
          <Money amount={order.product.price} />
        </Row>
        <Row label="Subtotal">
          <Money amount={order.subtotal} />
        </Row>
        <Row label={`Delivery (${DELIVERY_AREA_ADMIN_LABELS[order.deliveryArea]})`}>
          <Money amount={order.deliveryCharge} />
        </Row>
        {order.deliveryDiscount > 0 && (
          <Row label="Delivery discount">
            - <Money amount={order.deliveryDiscount} />
          </Row>
        )}
        <Row label="Total" strong>
          <Money amount={order.total} bold />
        </Row>
        {order.advanceAmount > 0 && (
          <Row label="Paid in advance">
            <Money amount={order.advanceAmount} />
          </Row>
        )}
        <Row label="Due on delivery" strong>
          <Money amount={order.dueOnDelivery} bold />
        </Row>
      </dl>
      <p className="text-desc">Payment: {PAYMENT_LABELS[order.paymentOption]}</p>
    </div>
  );
}
