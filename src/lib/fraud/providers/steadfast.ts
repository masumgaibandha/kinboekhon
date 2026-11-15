import type { FraudProvider, ProviderResult } from "@/lib/fraud/providers/types";

// Steadfast official API (API key and secret from the merchant panel). Confirm this path with Steadfast when the keys arrive.
const BASE_URL = "https://portal.packzy.com/api/v1";
const fraudCheckUrl = (phone: string) => `${BASE_URL}/fraud_check/${phone}`;
const TIMEOUT_MS = 8000;

function keys() {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  return apiKey && secretKey ? { apiKey, secretKey } : null;
}

function count(value: unknown): number | null {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof number === "number" && Number.isInteger(number) && number >= 0 ? number : null;
}

// Reads the courier score counts; anything else is a bad response.
function readCounts(body: unknown): ProviderResult {
  const root = body !== null && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const data = root.data !== null && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;
  const delivered = count(data.total_delivered);
  const failed = count(data.total_cancelled);
  if (delivered === null || failed === null) return { status: "error", error: "bad_response" };
  const total = Math.max(count(data.total_parcels) ?? 0, delivered + failed);
  return { status: total === 0 ? "no_history" : "found", delivered, failed, total };
}

export const steadfastProvider: FraudProvider = {
  id: "steadfast",
  label: "Steadfast",
  connected: () => keys() !== null,
  async check(phone) {
    const auth = keys();
    if (!auth) return { status: "error", error: "not_connected" };
    try {
      const response = await fetch(fraudCheckUrl(phone), {
        headers: { "Api-Key": auth.apiKey, "Secret-Key": auth.secretKey, Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
      if (!response.ok) return { status: "error", error: `http_${response.status}` };
      return readCounts(await response.json().catch(() => null));
    } catch (error) {
      return { status: "error", error: error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network" };
    }
  },
};
