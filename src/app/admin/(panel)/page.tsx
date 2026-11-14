import type { Metadata } from "next";

import { CallsCard } from "@/components/admin/dashboard/CallsCard";
import { PeriodSwitch } from "@/components/admin/dashboard/PeriodSwitch";
import { ProductStatsTable } from "@/components/admin/dashboard/ProductStatsTable";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Money } from "@/components/ui/Money";
import { requireAdmin } from "@/lib/admin-session";
import { getCallQueue, getCallResults, getCallTodo } from "@/lib/orders/call-stats";
import { ORDER_STATUSES } from "@/lib/orders/enums";
import { getDashboardStats } from "@/lib/orders/stats";
import { STATUS_LABELS } from "@/lib/orders/status";
import { dashboardHref, periodStart, readPeriod } from "@/lib/validation/dashboard-period";

export const metadata: Metadata = { title: "Dashboard" };

export const instant = false;

const showPercent = (value: number | null) => (value === null ? "-" : `${value}%`);

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const params = await searchParams;
  const period = readPeriod(params.period);
  const callsPeriod = readPeriod(params.calls);
  const now = new Date();
  const [stats, callTodo, callResults, callQueue] = await Promise.all([
    getDashboardStats(periodStart(period, now)),
    getCallTodo(),
    getCallResults(periodStart(callsPeriod, now)),
    getCallQueue(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Dashboard</h1>
        <PeriodSwitch current={period} label="Period" hrefOf={(next) => dashboardHref(next, callsPeriod)} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Orders">{stats.orders}</StatCard>
        <StatCard label="Total sales">
          <Money amount={stats.totalSales} bold />
        </StatCard>
        <StatCard label="Delivered value">
          <Money amount={stats.deliveredValue} bold />
        </StatCard>
        <StatCard label="Return %">{showPercent(stats.returnPercent)}</StatCard>
        <StatCard label="Cancel %">{showPercent(stats.cancelPercent)}</StatCard>
      </div>

      <CallsCard
        todo={callTodo}
        results={callResults}
        queue={callQueue}
        period={callsPeriod}
        hrefOf={(next) => dashboardHref(period, next)}
        now={now}
      />

      <section className="space-y-2">
        <h2 className="font-semibold text-heading">Orders by status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {ORDER_STATUSES.map((status) => (
            <StatCard key={status} label={STATUS_LABELS[status]}>
              {stats.byStatus[status]}
            </StatCard>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-heading">Orders per product</h2>
        <ProductStatsTable products={stats.products} />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-heading">Needs attention now</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Incomplete orders" href="/admin/incomplete">
            {stats.incomplete}
          </StatCard>
          <StatCard label="Advance payments waiting" href="/admin/payments">
            {stats.paymentsWaiting}
          </StatCard>
        </div>
      </section>
    </div>
  );
}
