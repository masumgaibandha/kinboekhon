import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlockedBadge } from "@/components/admin/customers/BlockedBadge";
import { CustomerSummaryCard } from "@/components/admin/customers/CustomerSummaryCard";
import { DeliveryHistoryCard } from "@/components/admin/fraud/DeliveryHistoryCard";
import { AdminNoteForm } from "@/components/admin/orders/AdminNoteForm";
import { CallOutcomeForm } from "@/components/admin/orders/CallOutcomeForm";
import { OrderAmounts } from "@/components/admin/orders/OrderAmounts";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { OrderCustomer } from "@/components/admin/orders/OrderCustomer";
import { OrderPayment } from "@/components/admin/orders/OrderPayment";
import { OrderTracking } from "@/components/admin/orders/OrderTracking";
import { ReturnReasonForm } from "@/components/admin/orders/ReturnReasonForm";
import { StatusBadge } from "@/components/admin/orders/StatusBadge";
import { StatusForm } from "@/components/admin/orders/StatusForm";
import { StatusHistory } from "@/components/admin/orders/StatusHistory";
import { PathaoCard } from "@/components/admin/pathao/PathaoCard";
import { OutOfStockBadge } from "@/components/admin/stock/StockLevelBadge";
import { requireAdmin } from "@/lib/admin-session";
import { getCustomerSummary } from "@/lib/customers/customer-summary";
import { formatDhakaDateTime } from "@/lib/dates";
import { getDeliveryHistory } from "@/lib/fraud/delivery-history";
import { getOrderForAdmin } from "@/lib/orders/admin-order-detail";
import { NOT_SENT } from "@/lib/orders/admin-order-list";
import { PRINT_PATH } from "@/lib/orders/print-path";
import { getProductStocks } from "@/lib/stock/stock-alerts";

export const metadata: Metadata = { title: "Order" };

export const instant = false;

export default async function OrderPage({ params }: PageProps<"/admin/orders/[orderNumber]">) {
  await requireAdmin();
  const { orderNumber } = await params;
  const order = await getOrderForAdmin(orderNumber);
  if (!order) notFound();
  const [summary, history, stocks] = await Promise.all([
    getCustomerSummary(order.customer.phone, order.orderNumber),
    getDeliveryHistory(order.customer.phone),
    getProductStocks(order.items.map((item) => item.productId)),
  ]);
  const outOfStock = NOT_SENT.includes(order.status) && order.items.some((item) => (stocks.get(item.productId)?.stock ?? 0) <= 0);
  const failed = order.status === "cancelled" || order.status === "returned";
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
        {order.customerBlocked && <BlockedBadge />}
        {outOfStock && <OutOfStockBadge />}
        <span className="text-sm text-muted">Placed {formatDhakaDateTime(order.createdAt)}</span>
        <a
          href={`${PRINT_PATH}?orderNumbers=${order.orderNumber}`}
          target="_blank"
          rel="noopener"
          className="ml-auto rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand-dark"
        >
          Print invoice
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <OrderCard title="Customer">
            <OrderCustomer key={key} order={order} />
          </OrderCard>
          <CustomerSummaryCard summary={summary} />
          <DeliveryHistoryCard
            history={history}
            orderNumber={order.orderNumber}
            deliveryCharge={order.deliveryCharge}
            formKey={key}
          />
          <OrderCard title="Product and amounts">
            <OrderAmounts order={order} />
          </OrderCard>
          <OrderCard title="Payment">
            <OrderPayment order={order} />
          </OrderCard>
          <OrderCard title="Tracking">
            <OrderTracking tracking={order.tracking} />
          </OrderCard>
        </div>
        <div className="space-y-4">
          <OrderCard title="Status">
            <StatusForm
              key={key}
              orderNumber={order.orderNumber}
              status={order.status}
              paymentWaiting={order.payment.status === "submitted"}
            />
          </OrderCard>
          <PathaoCard order={order} formKey={key} />
          {failed && (
            <OrderCard title="Return reason">
              <ReturnReasonForm key={key} orderNumber={order.orderNumber} reason={order.returnReason} />
            </OrderCard>
          )}
          <OrderCard title="Call outcome">
            <CallOutcomeForm key={key} orderNumber={order.orderNumber} />
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
