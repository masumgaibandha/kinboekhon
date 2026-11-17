import type { FraudProvider, ProviderResult } from "@/lib/fraud/providers/types";
import { steadfastKeys, steadfastRequest } from "@/lib/steadfast/client";

function count(value: unknown): number | null {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof number === "number" && Number.isInteger(number) && number >= 0 ? number : null;
}

// Reads { total_parcels, total_delivered, total_cancelled }; anything else is a bad response.
export function readCounts(body: unknown): ProviderResult {
  const data = body !== null && typeof body === "object" ? (body as Record<string, unknown>) : {};
  // Since 27 September 2026 this endpoint answers all zeros with a sunset notice: that is not real history.
  if (data.sunset !== undefined || typeof data.notice === "string") return { status: "error", error: "endpoint_retired" };
  const delivered = count(data.total_delivered);
  const failed = count(data.total_cancelled);
  if (delivered === null || failed === null) return { status: "error", error: "bad_response" };
  const total = Math.max(count(data.total_parcels) ?? 0, delivered + failed);
  return { status: total === 0 ? "no_history" : "found", delivered, failed, total };
}

export const steadfastProvider: FraudProvider = {
  id: "steadfast",
  label: "Steadfast",
  connected: () => steadfastKeys() !== null,
  async check(phone) {
    if (!steadfastKeys()) return { status: "error", error: "not_connected" };
    try {
      const response = await steadfastRequest("GET", `/fraud_check/${phone}`);
      if (!response.ok) return { status: "error", error: `http_${response.status}` };
      return readCounts(await response.json().catch(() => null));
    } catch (error) {
      return { status: "error", error: error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network" };
    }
  },
};
