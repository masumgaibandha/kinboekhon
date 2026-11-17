import { HistoryStatusBadge } from "@/components/admin/fraud/HistoryStatusBadge";
import { errorText } from "@/components/admin/fraud/error-text";
import { scoreCells, scoreNotes } from "@/components/admin/fraud/score-summary";
import { formatDhakaDateTime } from "@/lib/dates";
import type { HistoryRow } from "@/lib/fraud/delivery-history";

const show = (value: number | null) => (value === null ? "-" : String(value));

// Delivered, Cancelled / returned and Total: ratios and volume for a courier score, counts for a manual entry.
function countCells(row: HistoryRow): string[] {
  if (row.courierScore) return scoreCells(row.courierScore);
  return [show(row.delivered), show(row.failed), show(row.total)];
}

export function HistoryRows({ rows }: { rows: HistoryRow[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="py-2 pr-3 font-medium">Source</th>
            <th className="py-2 pr-3 font-medium">Delivered</th>
            <th className="py-2 pr-3 font-medium">Cancelled / returned</th>
            <th className="py-2 pr-3 font-medium">Total</th>
            <th className="py-2 pr-3 font-medium">Checked</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.source} className="border-b border-line align-top last:border-0">
              <td className="py-2 pr-3 font-medium text-heading">
                {row.label}
                {row.courierScore && <span className="block text-xs font-normal text-desc">{scoreNotes(row.courierScore)}</span>}
                {row.pathaoRating && <span className="block text-xs font-normal text-desc">Pathao rating: {row.pathaoRating}</span>}
                {row.note && <span className="block text-xs font-normal text-desc">{row.note}</span>}
              </td>
              {countCells(row).map((cell, index) => (
                <td key={index} className="py-2 pr-3 text-body">
                  {cell}
                </td>
              ))}
              <td className="whitespace-nowrap py-2 pr-3 text-desc">{row.checkedAt ? formatDhakaDateTime(row.checkedAt) : "-"}</td>
              <td className="py-2">
                <HistoryStatusBadge status={row.status} />
                {row.status === "error" && (
                  <span className="mt-0.5 block text-xs text-brand-dark">
                    {errorText(row.error)}
                    {row.errorAt && `, ${formatDhakaDateTime(row.errorAt)}`}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
