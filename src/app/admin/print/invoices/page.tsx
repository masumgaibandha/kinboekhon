import type { Metadata } from "next";
import Link from "next/link";

import { Invoice } from "@/components/admin/print/Invoice";
import { PrintButton } from "@/components/admin/print/PrintButton";
import { requireAdmin } from "@/lib/admin-session";
import { getInvoiceOrders, invoiceListSchema, MAX_INVOICES } from "@/lib/orders/invoice";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Print invoices" };

export const instant = false;

// A5 paper, one invoice per page; the toolbar is not printed.
const PRINT_CSS = `
@page { size: A5 portrait; margin: 0; }
.invoice-page { min-height: 210mm; }
@media print {
  body { background: var(--color-card); }
  .invoice-page { break-after: page; height: 210mm; overflow: hidden; }
  .invoice-page:last-child { break-after: auto; }
}
`;

export default async function PrintInvoicesPage({ searchParams }: PageProps<"/admin/print/invoices">) {
  await requireAdmin();
  const raw = (await searchParams).orderNumbers;
  const parsed = invoiceListSchema.safeParse(Array.isArray(raw) ? raw : raw ? [raw] : []);
  const orders = parsed.success ? await getInvoiceOrders(parsed.data) : [];
  const { supportPhone, whatsappNumber } = await getSettings();

  return (
    <div className="min-h-screen bg-page print:bg-card">
      <style>{PRINT_CSS}</style>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-card px-4 py-3 print:hidden">
        <Link href="/admin/orders" className="text-sm font-medium text-desc hover:text-brand">
          Back to orders
        </Link>
        <p className="text-sm text-body">
          {orders.length} {orders.length === 1 ? "invoice" : "invoices"}, A5, one per page.
        </p>
        {orders.length > 0 && <PrintButton />}
      </div>
      {orders.length === 0 ? (
        <p className="p-6 text-desc">No orders to print. Tick up to {MAX_INVOICES} orders in the orders list.</p>
      ) : (
        <div className="space-y-6 py-6 print:space-y-0 print:py-0">
          {orders.map((order) => (
            <Invoice key={order.orderNumber} order={order} contact={{ supportPhone, whatsappNumber }} />
          ))}
        </div>
      )}
    </div>
  );
}
