import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin/orders/StatusBadge";
import { ReviewForm } from "@/components/admin/payments/ReviewForm";
import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import { METHOD_LABELS, OPTION_LABELS } from "@/lib/orders/payment-methods";
import type { QueuedPayment } from "@/lib/orders/payment-queue";

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="text-sm text-body">{children}</dd>
    </div>
  );
}

export function PaymentReviewCard({ payment }: { payment: QueuedPayment }) {
  return (
    <article className="rounded-xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/orders/${payment.orderNumber}`} className="text-lg font-bold text-heading hover:text-brand">
          {payment.orderNumber}
        </Link>
        <StatusBadge status={payment.status} />
        <span className="text-sm text-muted">Placed {formatDhakaDateTime(payment.createdAt)}</span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Item label="Expected advance">
          <span className="text-lg font-bold text-heading">
            <Money amount={payment.advanceAmount} bold />
          </span>
        </Item>
        <Item label="Method">{METHOD_LABELS[payment.method]}</Item>
        <Item label="Option">{OPTION_LABELS[payment.option]}</Item>
        <Item label="Sender">{payment.senderNumber}</Item>
        <Item label="Transaction ID">
          <span className="font-mono font-semibold">{payment.transactionId}</span>
        </Item>
        <Item label="Order total">
          <Money amount={payment.total} />
        </Item>
        <Item label="Customer">
          {payment.name}, {payment.phone}
        </Item>
        <Item label="Product">
          {payment.productName} x {payment.quantity}
        </Item>
      </dl>

      <div className="mt-4 border-t border-line pt-4">
        <ReviewForm orderNumber={payment.orderNumber} />
      </div>
    </article>
  );
}
