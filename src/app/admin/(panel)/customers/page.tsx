import type { Metadata } from "next";

import { CustomerFilters } from "@/components/admin/customers/CustomerFilters";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { Pagination } from "@/components/admin/orders/Pagination";
import { requireAdmin } from "@/lib/admin-session";
import { listCustomersForAdmin } from "@/lib/customers/admin-customer-list";
import { customerFiltersQuery, readCustomerFilters } from "@/lib/validation/customer-filters";

export const metadata: Metadata = { title: "Customers" };

export const instant = false;

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const filters = readCustomerFilters(await searchParams);
  const result = await listCustomersForAdmin(filters);
  const filtered = filters.q !== "" || filters.tag !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-heading">Customers</h1>
        <p className="text-sm text-desc">
          {result.total} {result.total === 1 ? "customer" : "customers"}
          {filtered ? " found" : ""}
        </p>
      </div>

      {/* Keyed on the query, so the inputs show the filters of the URL after every search. */}
      <CustomerFilters key={customerFiltersQuery(filters)} filters={filters} />

      {result.items.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">
          {filtered ? "No customers match these filters." : "No customers yet."}
        </p>
      ) : (
        <CustomersTable customers={result.items} />
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(page) => `/admin/customers${customerFiltersQuery(filters, page)}`}
      />
    </div>
  );
}
