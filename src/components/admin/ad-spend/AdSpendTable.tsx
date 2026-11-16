import Link from "next/link";

import { DeleteAdSpendButton } from "@/components/admin/ad-spend/DeleteAdSpendButton";
import { Money } from "@/components/ui/Money";
import type { AdSpendEntry } from "@/lib/ad-spend/ad-spend-entries";
import { formatDhakaDay } from "@/lib/dates";

export function AdSpendTable({ entries }: { entries: AdSpendEntry[] }) {
  if (entries.length === 0) {
    return <p className="rounded-xl border border-line bg-card p-6 text-desc">No ad spend in this period.</p>;
  }

  const totalBdt = entries.reduce((sum, entry) => sum + entry.amountBdt, 0);
  const totalUsd = entries.reduce((sum, entry) => sum + Math.round(entry.amountUsd * 100), 0) / 100;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-sm text-body">
        <thead className="border-b border-line text-left text-xs font-medium text-muted">
          <tr>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2 text-right">USD</th>
            <th className="px-3 py-2 text-right">Rate</th>
            <th className="px-3 py-2 text-right">Taka</th>
            <th className="px-3 py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-line">
              <td className="whitespace-nowrap px-3 py-2">{formatDhakaDay(entry.day)}</td>
              <td className="min-w-40 px-3 py-2 text-heading">
                {entry.productName}
                {entry.replaced && (
                  <span className="block text-xs font-semibold text-brand-dark">Not counted: Meta import covers this day</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">${entry.amountUsd.toFixed(2)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right">{entry.usdRate}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                <Money amount={entry.amountBdt} />
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/ad-spend/${entry.id}`}
                    className="rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand-dark"
                  >
                    Edit
                  </Link>
                  <DeleteAdSpendButton id={entry.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="font-semibold text-heading">
          <tr>
            <td className="px-3 py-2" colSpan={2}>
              Total
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right">${totalUsd.toFixed(2)}</td>
            <td />
            <td className="whitespace-nowrap px-3 py-2 text-right">
              <Money amount={totalBdt} />
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
