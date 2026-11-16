import Link from "next/link";
import type { ReactNode } from "react";

import { SignedMoney } from "@/components/admin/profit/SignedMoney";
import { Money } from "@/components/ui/Money";
import { UNASSIGNED_SPEND_ID, formatRoas, type ProfitNumbers, type ProfitRow } from "@/lib/profit/profit-math";

const COLUMNS = [
  "Ad spend",
  "Orders",
  "Confirmed",
  "Delivered",
  "Cost / order",
  "Cost / confirmed",
  "Revenue",
  "Product cost",
  "Courier",
  "Packaging",
  "COD charge",
  "Net profit",
  "ROAS",
] as const;

const showMoney = (amount: number | null) => (amount === null ? "-" : <Money amount={amount} />);

function cells(numbers: ProfitNumbers): ReactNode[] {
  return [
    <Money key="spend" amount={numbers.adSpend} />,
    numbers.orders,
    numbers.confirmed,
    numbers.delivered,
    showMoney(numbers.costPerOrder),
    showMoney(numbers.costPerConfirmed),
    <Money key="revenue" amount={numbers.revenue} />,
    <Money key="product" amount={numbers.productCost} />,
    <Money key="courier" amount={numbers.courierCost} />,
    <Money key="packaging" amount={numbers.packagingCost} />,
    <Money key="cod" amount={numbers.codCost} />,
    <SignedMoney key="profit" amount={numbers.netProfit} bold />,
    formatRoas(numbers.roas),
  ];
}

function NumberCells({ numbers, highlightCpa = false }: { numbers: ProfitNumbers; highlightCpa?: boolean }) {
  return cells(numbers).map((cell, index) => (
    <td
      key={COLUMNS[index]}
      className={`whitespace-nowrap px-3 py-2 text-right ${
        highlightCpa && COLUMNS[index] === "Cost / confirmed" ? "font-bold text-brand-dark" : ""
      }`}
    >
      {cell}
    </td>
  ));
}

export function ProfitTable({ rows, total }: { rows: ProfitRow[]; total: ProfitNumbers }) {
  if (rows.length === 0) {
    return <p className="rounded-xl border border-line bg-card p-6 text-desc">No orders or ad spend in this period.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-sm text-body">
        <thead className="border-b border-line text-left text-xs font-medium text-muted">
          <tr>
            <th className="px-3 py-2">Product</th>
            {COLUMNS.map((title) => (
              <th key={title} className="whitespace-nowrap px-3 py-2 text-right">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className={`border-b border-line ${row.aboveMaxCpa ? "bg-brand-light" : ""}`}>
              <td className="min-w-40 px-3 py-2">
                <span className="block font-medium text-heading">{row.name}</span>
                {row.aboveMaxCpa && <span className="text-xs font-semibold text-brand-dark">Above max CPA</span>}
                {row.productId === UNASSIGNED_SPEND_ID && (
                  <Link href="/admin/ads" className="text-xs font-medium text-brand-dark hover:underline">
                    Choose a product for the campaign
                  </Link>
                )}
              </td>
              <NumberCells numbers={row} highlightCpa={row.aboveMaxCpa} />
            </tr>
          ))}
        </tbody>
        <tfoot className="font-semibold text-heading">
          <tr>
            <td className="px-3 py-2">Total</td>
            <NumberCells numbers={total} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
