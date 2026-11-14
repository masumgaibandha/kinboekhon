import { CustomerEditor } from "@/components/admin/orders/CustomerEditor";
import { formatLocation } from "@/lib/locations/format";
import type { AdminOrder } from "@/lib/orders/admin-order-detail";
import { canEditCustomer } from "@/lib/orders/status";
import { customerFieldsOf } from "@/lib/validation/admin-order";

export function OrderCustomer({ order }: { order: AdminOrder }) {
  const { customer } = order;

  return (
    <CustomerEditor
      editable={canEditCustomer(order.status)}
      orderNumber={order.orderNumber}
      initial={customerFieldsOf(order)}
    >
      <div className="space-y-1 text-sm">
        <p className="text-base font-semibold text-heading">{customer.name}</p>
        <p className="flex flex-wrap items-center gap-3">
          <span className="text-body">{customer.phone}</span>
          <a
            href={`tel:${customer.phone}`}
            className="rounded-lg bg-brand px-3 py-1 text-sm font-semibold text-white"
          >
            Call
          </a>
        </p>
        <p className="text-body">{customer.address}</p>
        <p className="text-desc">{formatLocation(customer.location)}</p>
      </div>
    </CustomerEditor>
  );
}
