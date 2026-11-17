export const PROVIDER_IDS = ["steadfast"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

// A courier's score for a phone: percents of finished parcels, a parcel volume range and fraud reports.
export interface CourierScore {
  deliveryRatio: number | null;
  cancellationRatio: number | null;
  // As the courier sends them, for example "high" and "25+".
  volumeBand: string;
  volumeRange: string;
  totalReports: number;
  doubtfulReports: boolean;
  // Shown when the courier sends them; never used for the label.
  score: number | null;
  level: string;
}

// A finished lookup ("found" or "no_history") or a failure, kept as a short code.
export type ProviderResult =
  | { status: "found" | "no_history"; score: CourierScore }
  | { status: "error"; error: string };

// One source of courier delivery history for a phone. Add a source by adding one of these to the list in index.ts.
export interface FraudProvider {
  id: ProviderId;
  label: string;
  connected(): boolean;
  check(phone: string): Promise<ProviderResult>;
}
