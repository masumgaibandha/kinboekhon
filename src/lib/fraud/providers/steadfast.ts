import type { CourierScore, FraudProvider, ProviderResult } from "@/lib/fraud/providers/types";
import { isNewCustomer } from "@/lib/fraud/score-risk";
import { steadfastKeys, steadfastRequest } from "@/lib/steadfast/client";

function numberOf(value: unknown): number | null {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : null;
}

function percent(value: unknown): number | null {
  const number = numberOf(value);
  return number !== null && number >= 0 && number <= 100 ? number : null;
}

const shortText = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 40) : "");

// Reads the GET /fraud_check/score answer. A sunset notice (the retired /fraud_check answer) is not real history.
export function readScore(body: unknown): ProviderResult {
  const data = body !== null && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (data.sunset !== undefined || typeof data.notice === "string") return { status: "error", error: "endpoint_retired" };
  if (!("delivery_ratio" in data) || !("cancellation_ratio" in data)) return { status: "error", error: "bad_response" };

  const reports = numberOf(data.total_reports);
  const score: CourierScore = {
    deliveryRatio: percent(data.delivery_ratio),
    cancellationRatio: percent(data.cancellation_ratio),
    volumeBand: shortText(data.volume_band),
    volumeRange: shortText(data.volume_range),
    totalReports: reports !== null && reports > 0 ? Math.floor(reports) : 0,
    doubtfulReports: data.doubtful_reports === true,
    score: numberOf(data.score),
    level: shortText(data.level),
  };
  const nothing = isNewCustomer(score) && score.totalReports === 0 && !score.doubtfulReports;
  return { status: nothing ? "no_history" : "found", score };
}

export const steadfastProvider: FraudProvider = {
  id: "steadfast",
  label: "Steadfast",
  connected: () => steadfastKeys() !== null,
  async check(phone) {
    if (!steadfastKeys()) return { status: "error", error: "not_connected" };
    try {
      const response = await steadfastRequest("GET", `/fraud_check/score/${phone}`);
      if (!response.ok) return { status: "error", error: `http_${response.status}` };
      return readScore(await response.json().catch(() => null));
    } catch (error) {
      return { status: "error", error: error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network" };
    }
  },
};
