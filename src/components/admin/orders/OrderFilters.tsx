import Form from "next/form";
import Link from "next/link";

import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import { METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders/payment-methods";
import { STATUS_LABELS } from "@/lib/orders/status";
import type { OrderFilters as Filters } from "@/lib/validation/order-filters";

interface OrderFiltersProps {
  filters: Filters;
  products: { id: string; name: string }[];
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand";
const labelClass = "block text-xs font-medium text-desc";

interface FilterSelectProps {
  name: string;
  label: string;
  value: string;
  all: string;
  labels: Record<string, string>;
}

function FilterSelect({ name, label, value, all, labels }: FilterSelectProps) {
  return (
    <div>
      <label htmlFor={`filter-${name}`} className={labelClass}>
        {label}
      </label>
      <select id={`filter-${name}`} name={name} defaultValue={value} className={fieldClass}>
        <option value="">{all}</option>
        {Object.entries(labels).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

// A plain GET form: the filters live in the URL, so a filtered list can be bookmarked or reloaded.
export function OrderFilters({ filters, products }: OrderFiltersProps) {
  return (
    <Form action="/admin/orders" className="grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <label htmlFor="filter-q" className={labelClass}>
          Search
        </label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Order number, phone or name"
          className={fieldClass}
        />
      </div>
      <FilterSelect name="status" label="Status" value={filters.status} all="All statuses" labels={STATUS_LABELS} />
      <FilterSelect name="method" label="Payment method" value={filters.method} all="All methods" labels={METHOD_LABELS} />
      <FilterSelect
        name="payment"
        label="Payment status"
        value={filters.payment}
        all="All payment statuses"
        labels={PAYMENT_STATUS_LABELS}
      />
      <FilterSelect
        name="call"
        label="Latest call"
        value={filters.call}
        all="All call outcomes"
        labels={CALL_OUTCOME_LABELS}
      />
      <div>
        <label htmlFor="filter-product" className={labelClass}>
          Product
        </label>
        <select id="filter-product" name="product" defaultValue={filters.product} className={fieldClass}>
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-from" className={labelClass}>
          From
        </label>
        <input id="filter-from" name="from" type="date" defaultValue={filters.from} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="filter-to" className={labelClass}>
          To
        </label>
        <input id="filter-to" name="to" type="date" defaultValue={filters.to} className={fieldClass} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Apply filters
        </button>
        <Link href="/admin/orders" className="text-sm font-medium text-desc hover:text-brand">
          Clear
        </Link>
      </div>
    </Form>
  );
}
