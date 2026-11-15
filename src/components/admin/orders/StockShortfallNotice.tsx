import Link from "next/link";

import type { StockShortfall } from "@/lib/stock/stock-alerts";

// Warns when confirmed orders need more units than are in stock.
export function StockShortfallNotice({ shortfalls }: { shortfalls: StockShortfall[] }) {
  if (shortfalls.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl border border-brand bg-brand-light p-4 text-sm text-body">
      <p className="font-semibold text-brand-dark">Confirmed orders need more stock than you have</p>
      <ul className="mt-2 space-y-1">
        {shortfalls.map((row) => (
          <li key={row.id}>
            <Link href={`/admin/products/${row.id}`} className="font-medium text-heading hover:text-brand hover:underline">
              {row.name}
            </Link>
            : {row.confirmedUnits} units in confirmed orders, {row.stock} in stock.
          </li>
        ))}
      </ul>
    </div>
  );
}
