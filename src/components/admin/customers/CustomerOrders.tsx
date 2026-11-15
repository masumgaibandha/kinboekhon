import Link from "next/link";

import { BlockedBadge } from "@/components/admin/customers/BlockedBadge";
import { StatusBadge } from "@/components/admin/orders/StatusBadge";
import { Money } from "@/components/ui/Money";
import type { CustomerOrderRow } from "@/lib/customers/admin-customer-detail";
import { formatDhakaDateTime } from "@/lib/dates";
import { itemsLabel } from "@/lib/orders/order-items";

export function CustomerOrders({ orders }: { orders: CustomerOrderRow[] }) {
  if (orders.length === 0) return <p className="text-sm text-desc">No orders.</p>;

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="px-5 py-2 font-medium">Order</th>
            <th className="px-5 py-2 font-medium">Placed</th>
            <th className="px-5 py-2 font-medium">Product</th>
            <th className="px-5 py-2 font-medium">Total</th>
            <th className="px-5 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNumber} className="border-b border-line last:border-0">
              <td className="px-5 py-2 font-semibold">
                <Link href={`/admin/orders/${order.orderNumber}`} className="text-heading hover:text-brand hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="whitespace-nowrap px-5 py-2 text-desc">{formatDhakaDateTime(order.createdAt)}</td>
              <td className="px-5 py-2 text-body">
                {itemsLabel(order.items)}
              </td>
              <td className="whitespace-nowrap px-5 py-2">
                <Money amount={order.total} />
              </td>
              <td className="space-y-1 px-5 py-2">
                <StatusBadge status={order.status} />
                {order.customerBlocked && (
                  <span className="block">
                    <BlockedBadge />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
