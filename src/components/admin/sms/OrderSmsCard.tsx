import Link from "next/link";

import { OrderCard } from "@/components/admin/orders/OrderCard";
import { ManualSmsForm } from "@/components/admin/sms/ManualSmsForm";
import { SmsStatusBadge } from "@/components/admin/sms/SmsStatusBadge";
import { formatDhakaDateTime } from "@/lib/dates";
import { smsLink } from "@/lib/sms/providers";
import type { SmsLogRow } from "@/lib/sms/sms-log";
import { SMS_TEMPLATE_LABELS } from "@/lib/sms/templates";

interface OrderSmsCardProps {
  orderNumber: string;
  rows: SmsLogRow[];
  blocked: boolean;
  formKey: string;
}

export function OrderSmsCard({ orderNumber, rows, blocked, formKey }: OrderSmsCardProps) {
  return (
    <OrderCard
      title="SMS"
      action={
        <Link href="/admin/sms" className="text-sm font-medium text-brand hover:underline">
          SMS log
        </Link>
      }
    >
      {!smsLink().connected && <p className="mb-3 text-sm font-semibold text-brand-dark">SMS not connected: SMS are logged, not sent.</p>}
      {rows.length === 0 ? (
        <p className="text-sm text-desc">No SMS for this order yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-line pb-2 last:border-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-body">{SMS_TEMPLATE_LABELS[row.template]}</span>
                <SmsStatusBadge status={row.status} />
                <span className="text-muted">
                  {row.parts} {row.parts === 1 ? "part" : "parts"}, {formatDhakaDateTime(row.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-desc">{row.text}</p>
              {row.reply && <p className="mt-0.5 text-xs text-muted">{row.reply}</p>}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        {blocked ? (
          <p className="text-sm text-brand-dark">Blocked customer: no SMS is sent for this order.</p>
        ) : (
          <ManualSmsForm key={formKey} orderNumber={orderNumber} />
        )}
      </div>
    </OrderCard>
  );
}
