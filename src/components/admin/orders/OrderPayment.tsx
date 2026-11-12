import Link from "next/link";
import type { ReactNode } from "react";

import { SwitchToCodForm } from "@/components/admin/orders/SwitchToCodForm";
import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import type { AdminOrder } from "@/lib/orders/admin-order-detail";
import { METHOD_LABELS, OPTION_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders/payment-methods";
import { calculateOrder } from "@/lib/orders/pricing";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-desc">{label}</dt>
      <dd className="text-right text-body">{children}</dd>
    </div>
  );
}

export function OrderPayment({ order }: { order: AdminOrder }) {
  const { payment } = order;
  const canSwitch = payment.status === "rejected" && payment.option !== "cod";

  return (
    <div className="space-y-3 text-sm">
      <dl>
        <Row label="Option">{OPTION_LABELS[payment.option]}</Row>
        <Row label="Status">
          <span className="font-semibold">{PAYMENT_STATUS_LABELS[payment.status]}</span>
        </Row>
        {payment.option !== "cod" && (
          <>
            <Row label="Method">{METHOD_LABELS[payment.method]}</Row>
            <Row label="Advance">
              <Money amount={payment.advanceAmount} />
            </Row>
          </>
        )}
        {payment.senderNumber && <Row label="Sender">{payment.senderNumber}</Row>}
        {payment.transactionId && (
          <Row label="Transaction ID">
            <span className="font-mono">{payment.transactionId}</span>
          </Row>
        )}
        {payment.reviewedAt && <Row label="Reviewed">{formatDhakaDateTime(payment.reviewedAt)}</Row>}
        {payment.reviewNote && <Row label="Review note">{payment.reviewNote}</Row>}
      </dl>
      {payment.status === "submitted" && (
        <Link href="/admin/payments" className="inline-block font-semibold text-brand-dark hover:underline">
          Review this payment
        </Link>
      )}
      {canSwitch && (
        <SwitchToCodForm
          key={order.version}
          orderNumber={order.orderNumber}
          newTotal={calculateOrder(order.product.price, order.quantity, order.deliveryCharge, "cod").total}
        />
      )}
    </div>
  );
}
