import Link from "next/link";

import { filtersQuery, type OrderFilters } from "@/lib/validation/order-filters";

interface PaginationProps {
  filters: OrderFilters;
  page: number;
  pageCount: number;
}

const linkClass = "rounded-lg border border-line-strong bg-card px-3 py-1.5 font-medium text-body hover:border-brand";

export function Pagination({ filters, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) return null;
  const href = (target: number) => `/admin/orders${filtersQuery(filters, target)}`;

  return (
    <nav aria-label="Pages" className="flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-desc">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={linkClass}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
