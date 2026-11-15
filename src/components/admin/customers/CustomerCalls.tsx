import Link from "next/link";

import { CallBadge } from "@/components/admin/orders/CallBadge";
import type { CustomerCall } from "@/lib/customers/admin-customer-detail";
import { formatDhakaDateTime } from "@/lib/dates";

// Every call on every order of the customer, newest first.
export function CustomerCalls({ calls }: { calls: CustomerCall[] }) {
  if (calls.length === 0) return <p className="text-sm text-desc">Not called yet.</p>;

  return (
    <ol className="space-y-3">
      {calls.map((call) => (
        <li key={`${call.orderNumber}-${call.at.toISOString()}`} className="text-sm">
          <p className="flex flex-wrap items-center gap-2">
            <CallBadge outcome={call.outcome} />
            <Link href={`/admin/orders/${call.orderNumber}`} className="font-semibold text-heading hover:text-brand hover:underline">
              {call.orderNumber}
            </Link>
            <span className="text-muted">{formatDhakaDateTime(call.at)}</span>
          </p>
          {call.note && <p className="mt-0.5 whitespace-pre-line break-words text-desc">{call.note}</p>}
        </li>
      ))}
    </ol>
  );
}
