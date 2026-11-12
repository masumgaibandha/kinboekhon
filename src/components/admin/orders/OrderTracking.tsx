import type { ReactNode } from "react";

import type { AdminTracking } from "@/lib/orders/admin-order-detail";
import type { TurnstileResult } from "@/lib/turnstile";

const TURNSTILE_LABELS: Record<TurnstileResult, string> = {
  passed: "Passed",
  failed: "Failed",
  unverified: "Unverified (Cloudflare could not be reached)",
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="shrink-0 text-desc">{label}</dt>
      <dd className="min-w-0 break-words text-right text-body">{children}</dd>
    </div>
  );
}

export function OrderTracking({ tracking }: { tracking: AdminTracking }) {
  if (!tracking.ipHash) return <p className="text-sm text-muted">Not recorded for this order.</p>;

  return (
    <dl className="text-sm">
      <Row label="Turnstile">{tracking.turnstile ? TURNSTILE_LABELS[tracking.turnstile] : "Not recorded"}</Row>
      <Row label="Same address, 24 hours before">
        {tracking.sameIpOrders === 0
          ? "No other orders"
          : `${tracking.sameIpOrders} other ${tracking.sameIpOrders === 1 ? "order" : "orders"}`}
      </Row>
      <Row label="Address (hashed)">
        <span className="font-mono text-xs">{tracking.ipHash.slice(0, 12)}</span>
      </Row>
      <Row label="Browser">
        <span className="text-xs">{tracking.userAgent || "Unknown"}</span>
      </Row>
    </dl>
  );
}
