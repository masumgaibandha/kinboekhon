import Link from "next/link";

import { StatusBadge } from "@/components/admin/orders/StatusBadge";
import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import type { OrderListItem } from "@/lib/orders/admin-order-list";

export function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Placed</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Area</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNumber} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-semibold">
                <Link href={`/admin/orders/${order.orderNumber}`} className="text-heading hover:text-brand hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-desc">{formatDhakaDateTime(order.createdAt)}</td>
              <td className="px-4 py-3">
                <span className="block font-medium text-heading">{order.name}</span>
                <span className="text-desc">{order.phone}</span>
              </td>
              <td className="px-4 py-3 text-body">
                {order.productName} <span className="whitespace-nowrap text-muted">x {order.quantity}</span>
              </td>
              <td className="px-4 py-3 text-body">{order.area}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <Money amount={order.total} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
