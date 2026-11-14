import Link from "next/link";
import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { AdminOrder } from "@/lib/orders/admin-order-detail";

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
        <Row label="Delivery">Free</Row>
        {order.discount > 0 && (
          <Row label="Full advance discount">
            - <Money amount={order.discount} />
          </Row>
        )}
        <Row label="Total" strong>
          <Money amount={order.total} bold />
        </Row>
        {order.payment.advanceAmount > 0 && (
          <Row label="Advance">
            <Money amount={order.payment.advanceAmount} />
          </Row>
        )}
        <Row label="Due on delivery" strong>
          <Money amount={order.payment.dueOnDelivery} bold />
        </Row>
      </dl>
    </div>
  );
}
