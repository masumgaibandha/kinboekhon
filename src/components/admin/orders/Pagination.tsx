import Link from "next/link";

interface PaginationProps {
  page: number;
  pageCount: number;
  // Link for a page number, keeping the current filters.
  hrefFor: (page: number) => string;
}

const linkClass = "rounded-lg border border-line-strong bg-card px-3 py-1.5 font-medium text-body hover:border-brand";

export function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pages" className="flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-desc">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
