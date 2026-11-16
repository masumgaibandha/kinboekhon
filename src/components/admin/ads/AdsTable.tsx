import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { AdsRow } from "@/lib/meta-ads/ads-math";
import { formatRoas } from "@/lib/profit/profit-math";

interface AdsTableProps {
  title: string;
  rows: AdsRow[];
  // Account currency; a USD account also shows the dollar spend.
  currency: string | null;
  extra?: { title: string; cell: (row: AdsRow) => ReactNode };
}

const COLUMNS = ["Spend", "Meta purchases", "Our orders", "Confirmed", "Delivered", "Returned", "Cost / confirmed", "Cost / delivered", "Real ROAS"];

const showMoney = (amount: number | null) => (amount === null ? "-" : <Money amount={amount} />);

function SpendCell({ row, currency }: { row: AdsRow; currency: string | null }) {
  return (
    <>
      <Money amount={row.spendBdt} />
      {currency === "USD" && <span className="block text-xs text-muted">${row.spend.toFixed(2)}</span>}
    </>
  );
}

export function AdsTable({ title, rows, currency, extra }: AdsTableProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-heading">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">No spend or orders in this period.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-sm text-body">
            <thead className="border-b border-line text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-3 py-2">Name</th>
                {extra && <th className="px-3 py-2">{extra.title}</th>}
                {COLUMNS.map((column) => (
                  <th key={column} className="whitespace-nowrap px-3 py-2 text-right">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={`border-b border-line ${row.considerPausing ? "bg-brand-light" : ""}`}>
                  <td className="min-w-48 px-3 py-2">
                    <span className="block font-medium text-heading">{row.name || row.id}</span>
                    {row.parent && <span className="block text-xs text-muted">{row.parent}</span>}
                    {row.considerPausing && <span className="block text-xs font-semibold text-brand-dark">Consider pausing</span>}
                  </td>
                  {extra && <td className="px-3 py-2">{extra.cell(row)}</td>}
                  {[
                    <SpendCell key="spend" row={row} currency={currency} />,
                    row.purchases,
                    row.orders,
                    row.confirmed,
                    row.delivered,
                    row.returned,
                    showMoney(row.costPerConfirmed),
                    showMoney(row.costPerDelivered),
                    formatRoas(row.roas),
                  ].map((cell, index) => (
                    <td key={COLUMNS[index]} className="whitespace-nowrap px-3 py-2 text-right">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
