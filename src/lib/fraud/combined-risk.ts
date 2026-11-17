import { RISK_LABELS, riskLabel, type FraudSettings, type HistoryCounts, type RiskLabel } from "@/lib/fraud/risk";
import { steadfastLabel } from "@/lib/fraud/score-risk";
import type { DeliveryCheckDocument } from "@/lib/models/DeliveryCheck";

export type RiskRow = Pick<DeliveryCheckDocument, "delivered" | "failed" | "checkedAt" | "courierScore">;

// Sums every source that has counts. Null when no source ever gave or got any.
export function sumCounts(rows: RiskRow[]): HistoryCounts | null {
  const usable = rows.filter((row) => row.checkedAt && row.delivered !== null && row.failed !== null);
  if (usable.length === 0) return null;
  return usable.reduce(
    (sum, row) => ({ delivered: sum.delivered + (row.delivered ?? 0), failed: sum.failed + (row.failed ?? 0) }),
    { delivered: 0, failed: 0 },
  );
}

// The phone's label: the riskiest of the summed counts (Settings thresholds) and each courier score. Null with nothing to go on.
export function combinedRisk(rows: RiskRow[], settings: FraudSettings): RiskLabel | null {
  const labels: RiskLabel[] = [];
  const counts = sumCounts(rows);
  if (counts) labels.push(riskLabel(counts, settings));
  for (const row of rows) if (row.checkedAt && row.courierScore) labels.push(steadfastLabel(row.courierScore));
  if (labels.length === 0) return null;
  return labels.reduce((worst, label) => (RISK_LABELS.indexOf(label) > RISK_LABELS.indexOf(worst) ? label : worst));
}
