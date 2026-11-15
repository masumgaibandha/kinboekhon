import Link from "next/link";

import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import type { StockMoveKind } from "@/lib/models/StockMove";
import type { StockMoveItem } from "@/lib/stock/product-stock";

const KIND_LABELS: Record<StockMoveKind, string> = {
  purchase: "Purchase in",
  shipped: "Order shipped",
  returned: "Parcel returned",
  damaged: "Return damaged",
  adjustment: "Adjustment",
};

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

export function StockHistory({ moves }: { moves: StockMoveItem[] }) {
  if (moves.length === 0) return <p className="text-sm text-desc">No stock moves yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="py-2 pr-3 font-medium">When</th>
            <th className="py-2 pr-3 font-medium">Move</th>
            <th className="py-2 pr-3 text-right font-medium">Change</th>
            <th className="py-2 pr-3 text-right font-medium">Stock after</th>
            <th className="py-2 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move) => (
            <tr key={move.id} className="border-b border-line last:border-0">
              <td className="whitespace-nowrap py-2 pr-3 text-desc">{formatDhakaDateTime(move.createdAt)}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-body">{KIND_LABELS[move.kind]}</td>
              <td className={`py-2 pr-3 text-right font-semibold ${move.change < 0 ? "text-brand-dark" : "text-heading"}`}>
                {signed(move.change)}
              </td>
              <td className="py-2 pr-3 text-right text-body">{move.balance}</td>
              <td className="py-2 text-desc">
                {move.orderNumber && (
                  <Link href={`/admin/orders/${move.orderNumber}`} className="mr-2 font-medium text-heading hover:text-brand hover:underline">
                    {move.orderNumber}
                  </Link>
                )}
                {move.unitCost !== undefined && (
                  <span className="mr-2">
                    <Money amount={move.unitCost} /> each
                  </span>
                )}
                {move.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
