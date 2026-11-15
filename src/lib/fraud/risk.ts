export const RISK_LABELS = ["unknown", "low", "check", "high"] as const;
export type RiskLabel = (typeof RISK_LABELS)[number];

export const RISK_LABEL_TEXT: Record<RiskLabel, string> = {
  unknown: "Unknown",
  low: "Low",
  check: "Check",
  high: "High",
};

export interface FraudSettings {
  // Fewer finished parcels than this is "Check": too little history to trust.
  minRecords: number;
  // A failure rate at or above this percent is "Check".
  checkFailPercent: number;
  // At least this many failures and at least highFailPercent is "High".
  highMinFailed: number;
  highFailPercent: number;
  // Booking money to ask from a High risk customer, whole taka.
  bookingMoney: number;
}

export const DEFAULT_FRAUD_SETTINGS: FraudSettings = {
  minRecords: 3,
  checkFailPercent: 20,
  highMinFailed: 3,
  highFailPercent: 40,
  bookingMoney: 200,
};

export interface HistoryCounts {
  delivered: number;
  // Cancelled or returned parcels.
  failed: number;
}

export function failPercent({ delivered, failed }: HistoryCounts): number {
  const total = delivered + failed;
  return total === 0 ? 0 : Math.round((failed / total) * 100);
}

export function riskLabel(counts: HistoryCounts, settings: FraudSettings): RiskLabel {
  const total = counts.delivered + counts.failed;
  if (total === 0) return "unknown";
  const percent = (counts.failed / total) * 100;
  if (counts.failed >= settings.highMinFailed && percent >= settings.highFailPercent) return "high";
  if (total < settings.minRecords || percent >= settings.checkFailPercent) return "check";
  return "low";
}
