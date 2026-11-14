import Link from "next/link";

import { CallBadge } from "@/components/admin/orders/CallBadge";
import { formatAge } from "@/lib/dates";
import type { CallQueueItem } from "@/lib/orders/call-stats";

export function CallQueue({ orders, now }: { orders: CallQueueItem[]; now: Date }) {
  if (orders.length === 0) {
    return <p className="rounded-xl border border-line bg-card p-6 text-desc">No pending orders need a call.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs font-medium text-muted">
          <tr>
            <th className="px-4 py-2">Order</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Latest call</th>
            <th className="px-4 py-2 text-right">Waiting</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNumber} className="border-b border-line last:border-0">
              <td className="px-4 py-2 font-semibold">
                <Link href={`/admin/orders/${order.orderNumber}`} className="text-heading hover:text-brand hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-2">
                <span className="block font-medium text-heading">{order.name}</span>
                <span className="text-desc">{order.phone}</span>
              </td>
              <td className="px-4 py-2">
                {order.lastCall ? <CallBadge outcome={order.lastCall} /> : <span className="text-muted">Not called</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right text-body">{formatAge(order.createdAt, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
