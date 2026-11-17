import { connectMongoose } from "@/lib/db";
import { combinedRisk } from "@/lib/fraud/combined-risk";
import { getFraudSettings } from "@/lib/fraud/fraud-settings";
import { FRAUD_PROVIDERS } from "@/lib/fraud/providers";
import type { CourierScore } from "@/lib/fraud/providers/types";
import type { RiskLabel } from "@/lib/fraud/risk";
import { CHECK_CACHE_MS } from "@/lib/fraud/run-check";
import { DeliveryCheckModel, type CheckSource, type DeliveryCheckDocument } from "@/lib/models/DeliveryCheck";

export type HistoryStatus = "found" | "no_history" | "error" | "not_connected" | "not_checked" | "manual";

export interface HistoryRow {
  source: CheckSource;
  label: string;
  status: HistoryStatus;
  delivered: number | null;
  failed: number | null;
  total: number | null;
  courierScore: CourierScore | null;
  checkedAt: Date | null;
  error: string;
  errorAt: Date | null;
  pathaoRating: string;
  note: string;
}

export interface DeliveryHistory {
  rows: HistoryRow[];
  // Null until some source has counts or a score.
  risk: RiskLabel | null;
  anyConnected: boolean;
  // When the newest good lookup can be run again.
  nextCheckAt: Date | null;
}

type SavedRow = Omit<DeliveryCheckDocument, "phone">;

function rowOf(source: CheckSource, label: string, status: HistoryStatus, saved: SavedRow | undefined): HistoryRow {
  return {
    source,
    label,
    status,
    delivered: saved?.delivered ?? null,
    failed: saved?.failed ?? null,
    total: saved?.total ?? null,
    courierScore: saved?.courierScore ?? null,
    checkedAt: saved?.checkedAt ?? null,
    error: saved?.error ?? "",
    errorAt: saved?.errorAt ?? null,
    pathaoRating: saved?.pathaoRating ?? "",
    note: saved?.note ?? "",
  };
}

// The order page's Delivery history card for a phone.
export async function getDeliveryHistory(phone: string): Promise<DeliveryHistory> {
  await connectMongoose();
  const [saved, settings] = await Promise.all([
    DeliveryCheckModel.find({ phone }, { _id: 0, phone: 0 }).lean<SavedRow[]>(),
    getFraudSettings(),
  ]);
  const bySource = new Map(saved.map((row) => [row.source, row]));

  const rows = FRAUD_PROVIDERS.map((provider) => {
    const row = bySource.get(provider.id);
    const status: HistoryStatus = !provider.connected() ? "not_connected" : (row?.status ?? "not_checked");
    return rowOf(provider.id, provider.label, status, row);
  });
  const manual = bySource.get("manual");
  if (manual) rows.push(rowOf("manual", "Manual entry", "manual", manual));

  const lastGood = saved
    .filter((row) => row.source !== "manual" && row.checkedAt)
    .reduce<number | null>((latest, row) => Math.max(latest ?? 0, row.checkedAt?.getTime() ?? 0), null);
  return {
    rows,
    risk: combinedRisk(saved, settings),
    anyConnected: FRAUD_PROVIDERS.some((provider) => provider.connected()),
    nextCheckAt: lastGood ? new Date(lastGood + CHECK_CACHE_MS) : null,
  };
}
