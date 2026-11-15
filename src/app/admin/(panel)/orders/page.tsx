import type { Metadata } from "next";

import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { Pagination } from "@/components/admin/orders/Pagination";
import { BulkSendForm } from "@/components/admin/pathao/BulkSendForm";
import { requireAdmin } from "@/lib/admin-session";
import { listOrdersForAdmin } from "@/lib/orders/admin-order-list";
import { pathaoConfig } from "@/lib/pathao/config";
import { listProductsForAdmin } from "@/lib/products";
import { filtersQuery, readOrderFilters } from "@/lib/validation/order-filters";

export const metadata: Metadata = { title: "Orders" };

export const instant = false;

const BULK_SEND_FORM_ID = "pathao-bulk-send";

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const filters = readOrderFilters(await searchParams);
  const [result, products] = await Promise.all([listOrdersForAdmin(filters), listProductsForAdmin()]);
  const filtered = filtersQuery({ ...filters, page: 1 }) !== "";
  const bulkSend = pathaoConfig() !== null && result.items.some((order) => order.canSendToPathao);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-heading">Orders</h1>
        <p className="text-sm text-desc">
          {result.total} {result.total === 1 ? "order" : "orders"}
          {filtered ? " found" : ""}
        </p>
      </div>

      {/* Keyed on the query, so the inputs show the filters of the URL after every search. */}
      <OrderFilters
        key={filtersQuery(filters)}
        filters={filters}
        products={products.map((product) => ({ id: product.id, name: product.name }))}
      />

      {result.items.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">
          {filtered ? "No orders match these filters." : "No orders yet."}
        </p>
      ) : (
        <>
          {bulkSend && <BulkSendForm formId={BULK_SEND_FORM_ID} />}
          <OrdersTable orders={result.items} bulkFormId={bulkSend ? BULK_SEND_FORM_ID : undefined} />
        </>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(page) => `/admin/orders${filtersQuery(filters, page)}`}
      />
    </div>
  );
}
