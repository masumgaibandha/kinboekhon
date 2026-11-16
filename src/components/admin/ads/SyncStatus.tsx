import { SyncNowButton } from "@/components/admin/ads/SyncNowButton";
import { formatDhakaDateTime } from "@/lib/dates";
import type { LastSync } from "@/lib/meta-ads/last-sync";
import type { MetaAdsLink } from "@/lib/meta-ads/connection";

export function SyncStatus({ link, lastSync }: { link: MetaAdsLink; lastSync: LastSync | null }) {
  if (!link.connected) {
    return (
      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="text-lg font-semibold text-heading">Meta Ads not connected</h2>
        <p className="mt-1 text-sm text-desc">{link.reason} The token needs only the ads_read permission.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card p-5">
      <div className="text-sm text-desc">
        <p className="font-semibold text-heading">Meta Ads connected ({link.connection.accountId})</p>
        {lastSync ? (
          <p className="mt-1">
            Last sync {formatDhakaDateTime(lastSync.at)} ({lastSync.trigger === "cron" ? "daily" : "Sync now"}):{" "}
            {lastSync.ok ? `${lastSync.rows} ad days imported.` : <span className="text-brand-dark">{lastSync.error}</span>}
          </p>
        ) : (
          <p className="mt-1">Not synced yet.</p>
        )}
        <p className="mt-1 text-xs text-muted">Every day at 02:00 Dhaka time, today and the 7 days before it are imported again.</p>
      </div>
      <SyncNowButton />
    </section>
  );
}
