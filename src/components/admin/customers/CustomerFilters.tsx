import Form from "next/form";
import Link from "next/link";

import { CUSTOMER_TAG_LABELS } from "@/lib/customers/tags";
import { CUSTOMER_SORT_LABELS, type CustomerFilters as Filters } from "@/lib/validation/customer-filters";

const fieldClass =
  "mt-1 w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand";
const labelClass = "block text-xs font-medium text-desc";

// A plain GET form: the filters live in the URL, so a filtered list can be bookmarked or reloaded.
export function CustomerFilters({ filters }: { filters: Filters }) {
  return (
    <Form action="/admin/customers" className="grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <label htmlFor="customer-q" className={labelClass}>
          Search
        </label>
        <input
          id="customer-q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Name or phone"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="customer-tag" className={labelClass}>
          Tag
        </label>
        <select id="customer-tag" name="tag" defaultValue={filters.tag} className={fieldClass}>
          <option value="">All customers</option>
          {Object.entries(CUSTOMER_TAG_LABELS).map(([tag, label]) => (
            <option key={tag} value={tag}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="customer-sort" className={labelClass}>
          Sort by
        </label>
        <select id="customer-sort" name="sort" defaultValue={filters.sort} className={fieldClass}>
          {Object.entries(CUSTOMER_SORT_LABELS).map(([sort, label]) => (
            <option key={sort} value={sort}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Apply
        </button>
        <Link href="/admin/customers" className="text-sm font-medium text-desc hover:text-brand">
          Clear
        </Link>
      </div>
    </Form>
  );
}
