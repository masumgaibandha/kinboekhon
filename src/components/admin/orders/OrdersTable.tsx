import Link from "next/link";

import { BlockedBadge } from "@/components/admin/customers/BlockedBadge";
import { RiskBadge } from "@/components/admin/fraud/RiskBadge";
import { CallBadge } from "@/components/admin/orders/CallBadge";
import { StatusBadge } from "@/components/admin/orders/StatusBadge";
import { OutOfStockBadge } from "@/components/admin/stock/StockLevelBadge";
import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import type { OrderListItem } from "@/lib/orders/admin-order-list";

// With `bulkFormId`, every order gets a tick box for that bulk actions form.
export function OrdersTable({ orders, bulkFormId }: { orders: OrderListItem[]; bulkFormId?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            {bulkFormId && (
              <th className="w-10 px-4 py-3 font-medium">
                <span className="sr-only">Tick</span>
              </th>
            )}
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Placed</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Area</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Latest call</th>
            <th className="px-4 py-3 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNumber} className="border-b border-line last:border-0">
              {bulkFormId && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    form={bulkFormId}
                    name="orderNumbers"
                    value={order.orderNumber}
                    data-pathao={order.canSendToPathao}
                    aria-label={`Tick ${order.orderNumber}`}
                    className="h-4 w-4 accent-brand"
                  />
                </td>
              )}
              <td className="px-4 py-3 font-semibold">
                <Link href={`/admin/orders/${order.orderNumber}`} className="text-heading hover:text-brand hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-desc">{formatDhakaDateTime(order.createdAt)}</td>
              <td className="px-4 py-3">
                <span className="block font-medium text-heading">{order.name}</span>
                <span className="block text-desc">{order.phone}</span>
                {order.customerBlocked && <BlockedBadge />}
              </td>
              <td className="px-4 py-3 text-body">
                {order.productName} <span className="whitespace-nowrap text-muted">x {order.quantity}</span>
              </td>
              <td className="px-4 py-3 text-body">{order.area}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <Money amount={order.total} />
              </td>
              <td className="space-y-1 px-4 py-3">
                <StatusBadge status={order.status} />
                {order.outOfStock && (
                  <span className="block">
                    <OutOfStockBadge />
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {order.lastCall ? (
                  <>
                    <CallBadge outcome={order.lastCall.outcome} />
                    <span className="mt-0.5 block whitespace-nowrap text-xs text-muted">
                      {formatDhakaDateTime(order.lastCall.at)}
                    </span>
                  </>
                ) : (
                  <span className="text-muted">Not called</span>
                )}
              </td>
              <td className="px-4 py-3">
                {order.risk ? <RiskBadge risk={order.risk} /> : <span className="whitespace-nowrap text-muted">Not checked</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
