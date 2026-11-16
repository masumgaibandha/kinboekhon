import Link from "next/link";

import { SmsStatusBadge } from "@/components/admin/sms/SmsStatusBadge";
import { formatDhakaDateTime } from "@/lib/dates";
import type { SmsLogRow } from "@/lib/sms/sms-log";
import { SMS_TEMPLATE_LABELS } from "@/lib/sms/templates";

export function SmsLogTable({ rows }: { rows: SmsLogRow[] }) {
  if (rows.length === 0) return <p className="rounded-xl border border-line bg-card p-5 text-sm text-desc">No SMS yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Template</th>
            <th className="px-4 py-3">Parts</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Provider reply</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line align-top last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-desc">{formatDhakaDateTime(row.createdAt)}</td>
              <td className="px-4 py-3">
                <span className="font-medium text-body">{row.phone}</span>
                {row.template !== "test" && (
                  <Link href={`/admin/orders/${row.orderNumber}`} className="block text-xs font-semibold text-brand hover:underline">
                    {row.orderNumber}
                  </Link>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-body">{SMS_TEMPLATE_LABELS[row.template]}</span>
                <span className="mt-0.5 block max-w-xs text-xs text-desc">{row.text}</span>
              </td>
              <td className="px-4 py-3 text-body">{row.parts}</td>
              <td className="px-4 py-3">
                <SmsStatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-desc">
                {row.provider && <span className="font-medium text-body">{row.provider}: </span>}
                {row.reply || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
