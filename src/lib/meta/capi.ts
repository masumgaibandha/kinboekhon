import type { CapiUserData } from "@/lib/meta/user-data";

const GRAPH_URL = "https://graph.facebook.com/v24.0";
const TIMEOUT_MS = 8000;

export interface CapiCustomData {
  content_ids: string[];
  content_name: string;
  content_type: "product";
  currency: "BDT";
  value: number;
  num_items: number;
}

export interface CapiEvent {
  event_name: "InitiateCheckout" | "Purchase";
  event_id: string;
  event_time: number;
  event_source_url: string;
  action_source: "website";
  user_data: CapiUserData;
  custom_data: CapiCustomData;
}

export type CapiResult = { ok: true } | { ok: false; error: string };

interface CapiResponse {
  events_received?: number;
  error?: { code?: number };
}

// Sends one event; failures come back as a short code, the response body is never logged.
export async function sendCapiEvent(event: CapiEvent): Promise<CapiResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!/^\d+$/.test(pixelId) || !accessToken) return { ok: false, error: "not_configured" };
  const testEventCode = process.env.META_TEST_EVENT_CODE;
  const body = { data: [event], access_token: accessToken, ...(testEventCode ? { test_event_code: testEventCode } : {}) };

  try {
    const response = await fetch(`${GRAPH_URL}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = (await response.json().catch(() => ({}))) as CapiResponse;
    if (!response.ok) return { ok: false, error: data.error?.code ? `meta_${data.error.code}` : `http_${response.status}` };
    return data.events_received === 1 ? { ok: true } : { ok: false, error: "not_received" };
  } catch (error) {
    return { ok: false, error: error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network" };
  }
}
