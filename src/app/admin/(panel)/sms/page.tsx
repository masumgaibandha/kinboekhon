import type { Metadata } from "next";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { SmsLogTable } from "@/components/admin/sms/SmsLogTable";
import { Money } from "@/components/ui/Money";
import { requireAdmin } from "@/lib/admin-session";
import { smsLink } from "@/lib/sms/providers";
import { getSmsLog, getSmsMonth, SMS_LOG_LIMIT } from "@/lib/sms/sms-log";
import { getSmsSettings } from "@/lib/sms/sms-settings";

export const metadata: Metadata = { title: "SMS log" };

export const instant = false;

export default async function SmsLogPage() {
  await requireAdmin();
  const [rows, month, { sms }] = await Promise.all([getSmsLog(), getSmsMonth(), getSmsSettings()]);
  const link = smsLink();

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-heading">SMS log</h1>
        <p className="text-sm text-desc">Newest {SMS_LOG_LIMIT}</p>
      </div>
      {!link.connected && (
        <p className="rounded-lg bg-brand-light px-4 py-3 text-sm text-body">
          <strong className="text-brand-dark">SMS not connected.</strong> Nothing is sent: each SMS is only written to this
          log. {link.reason}
        </p>
      )}
      <h2 className="text-sm font-semibold text-heading">This month</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="SMS sent">{month.sent}</StatCard>
        <StatCard label="SMS parts sent">{month.sentParts}</StatCard>
        <StatCard label={`Estimated cost (${sms.pricePerPart} taka per part)`}>
          <Money amount={Math.round(month.sentParts * sms.pricePerPart)} bold />
        </StatCard>
        <StatCard label="Failed / skipped">
          {month.failed} / {month.skipped}
        </StatCard>
      </div>
      {month.notConnected > 0 && (
        <p className="text-sm text-desc">
          {month.notConnected} more SMS ({month.notConnectedParts} parts) were logged only, while SMS was not connected.
        </p>
      )}
      <SmsLogTable rows={rows} />
    </div>
  );
}
