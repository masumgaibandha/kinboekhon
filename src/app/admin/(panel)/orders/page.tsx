import type { Metadata } from "next";

import { BulkActions } from "@/components/admin/orders/BulkActions";
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { Pagination } from "@/components/admin/orders/Pagination";
import { StockShortfallNotice } from "@/components/admin/orders/StockShortfallNotice";
import { requireAdmin } from "@/lib/admin-session";
import { listOrdersForAdmin } from "@/lib/orders/admin-order-list";
import { pathaoConfig } from "@/lib/pathao/config";
import { listProductsForAdmin } from "@/lib/products";
import { getStockShortfalls } from "@/lib/stock/stock-alerts";
import { filtersQuery, readOrderFilters } from "@/lib/validation/order-filters";

export const metadata: Metadata = { title: "Orders" };

export const instant = false;

const BULK_FORM_ID = "orders-bulk";

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const filters = readOrderFilters(await searchParams);
  const [result, products, shortfalls] = await Promise.all([
    listOrdersForAdmin(filters),
    listProductsForAdmin(),
    getStockShortfalls(),
  ]);
  const filterQuery = filtersQuery({ ...filters, page: 1 });
  const bulkSend = pathaoConfig() !== null && result.items.some((order) => order.canSendToPathao);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Orders</h1>
        <div className="flex items-baseline gap-4">
          <p className="text-sm text-desc">
            {result.total} {result.total === 1 ? "order" : "orders"}
            {filterQuery ? " found" : ""}
          </p>
          <a
            href={`/api/admin/orders-export${filterQuery}`}
            download
            className="rounded-lg border border-line-strong bg-card px-3 py-1.5 text-sm font-semibold text-body hover:border-brand"
          >
            Export CSV
          </a>
        </div>
      </div>

      <StockShortfallNotice shortfalls={shortfalls} />

      {/* Keyed on the query, so the inputs show the filters of the URL after every search. */}
      <OrderFilters
        key={filtersQuery(filters)}
        filters={filters}
        products={products.map((product) => ({ id: product.id, name: product.name }))}
      />

      {result.items.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">
          {filterQuery ? "No orders match these filters." : "No orders yet."}
        </p>
      ) : (
        <>
          <BulkActions formId={BULK_FORM_ID} pathao={bulkSend} />
          <OrdersTable orders={result.items} bulkFormId={BULK_FORM_ID} />
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
