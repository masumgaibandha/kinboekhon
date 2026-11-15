export const PROVIDER_IDS = ["steadfast"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

// A finished lookup ("found" or "no_history") or a failure, kept as a short code.
export type ProviderResult =
  | { status: "found" | "no_history"; delivered: number; failed: number; total: number }
  | { status: "error"; error: string };

// One source of courier delivery history for a phone. Add a source by adding one of these to the list in index.ts.
export interface FraudProvider {
  id: ProviderId;
  label: string;
  connected(): boolean;
  check(phone: string): Promise<ProviderResult>;
}
