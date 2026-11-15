import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomerCalls } from "@/components/admin/customers/CustomerCalls";
import { CustomerNoteForm } from "@/components/admin/customers/CustomerNoteForm";
import { CustomerNotes } from "@/components/admin/customers/CustomerNotes";
import { CustomerOrders } from "@/components/admin/customers/CustomerOrders";
import { CustomerTagsForm } from "@/components/admin/customers/CustomerTagsForm";
import { TagBadges } from "@/components/admin/customers/TagBadges";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { Money } from "@/components/ui/Money";
import { requireAdmin } from "@/lib/admin-session";
import { getCustomerForAdmin } from "@/lib/customers/admin-customer-detail";
import { returnRate } from "@/lib/customers/customer-stats";
import { formatDhakaDateTime } from "@/lib/dates";

export const metadata: Metadata = { title: "Customer" };

export const instant = false;

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[phone]">) {
  await requireAdmin();
  const { phone } = await params;
  const customer = await getCustomerForAdmin(phone);
  if (!customer) notFound();
  // Every form is keyed on the saved version, so it always starts from fresh values.
  const key = `${customer.phone}-${customer.version}`;
  const { stats } = customer;

  return (
    <div className="space-y-4">
      <Link href="/admin/customers" className="text-sm font-medium text-desc hover:text-brand">
        Back to customers
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-heading">{customer.name}</h1>
        <TagBadges tags={customer.tags} />
      </div>
      <p className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-body">{customer.phone}</span>
        <a href={`tel:${customer.phone}`} className="rounded-lg bg-brand px-3 py-1 font-semibold text-white">
          Call
        </a>
        <span className="text-desc">{customer.district}</span>
        <span className="text-muted">Last order {formatDhakaDateTime(customer.lastOrderAt)}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Orders">{stats.orders}</StatCard>
        <StatCard label="Delivered">{stats.delivered}</StatCard>
        <StatCard label="Cancelled">{stats.cancelled}</StatCard>
        <StatCard label="Returned">{stats.returned}</StatCard>
        <StatCard label="Return rate">{returnRate(stats)}</StatCard>
        <StatCard label="Spent (delivered)">
          <Money amount={stats.spent} />
        </StatCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <OrderCard title="Orders">
            <CustomerOrders orders={customer.orders} />
          </OrderCard>
          <OrderCard title="Calls">
            <CustomerCalls calls={customer.calls} />
          </OrderCard>
        </div>
        <div className="space-y-4">
          <OrderCard title="Tags">
            <CustomerTagsForm key={key} phone={customer.phone} tags={customer.tags} />
          </OrderCard>
          <OrderCard title="Notes">
            <div className="space-y-4">
              <CustomerNoteForm key={key} phone={customer.phone} />
              <CustomerNotes notes={customer.notes} />
            </div>
          </OrderCard>
        </div>
      </div>
    </div>
  );
}
