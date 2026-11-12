import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNoteForm } from "@/components/admin/orders/AdminNoteForm";
import { OrderAmounts } from "@/components/admin/orders/OrderAmounts";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { OrderCustomer } from "@/components/admin/orders/OrderCustomer";
import { StatusBadge } from "@/components/admin/orders/StatusBadge";
import { StatusForm } from "@/components/admin/orders/StatusForm";
import { StatusHistory } from "@/components/admin/orders/StatusHistory";
import { requireAdmin } from "@/lib/admin-session";
import { formatDhakaDateTime } from "@/lib/dates";
import { getOrderForAdmin } from "@/lib/orders/admin-order-detail";
import { deliveryChargesFrom } from "@/lib/orders/pricing";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Order" };

export const instant = false;

export default async function OrderPage({ params }: PageProps<"/admin/orders/[orderNumber]">) {
  await requireAdmin();
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([getOrderForAdmin(orderNumber), getSettings()]);
  if (!order) notFound();
  // Every form is keyed on the saved version, so it always starts from fresh values.
  const key = `${order.orderNumber}-${order.version}`;

  return (
    <div className="space-y-4">
      <Link href="/admin/orders" className="text-sm font-medium text-desc hover:text-brand">
        Back to orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-heading">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">Placed {formatDhakaDateTime(order.createdAt)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <OrderCard title="Customer">
            <OrderCustomer key={key} order={order} charges={deliveryChargesFrom(settings)} />
          </OrderCard>
          <OrderCard title="Product and amounts">
            <OrderAmounts order={order} />
          </OrderCard>
        </div>
        <div className="space-y-4">
          <OrderCard title="Status">
            <StatusForm key={key} orderNumber={order.orderNumber} status={order.status} />
          </OrderCard>
          <OrderCard title="Admin note">
            <AdminNoteForm key={key} orderNumber={order.orderNumber} note={order.adminNote} />
          </OrderCard>
          <OrderCard title="History">
            <StatusHistory history={order.history} />
          </OrderCard>
        </div>
      </div>
    </div>
  );
}
