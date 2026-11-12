import { requiredEnv } from "@/lib/env";

export const TURNSTILE_RESULTS = ["passed", "failed", "unverified"] as const;
export type TurnstileResult = (typeof TURNSTILE_RESULTS)[number];

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;

interface VerifyResponse {
  success?: boolean;
  "error-codes"?: string[];
}

// "unverified" when Cloudflare can't be reached: the order is accepted and marked, the other checks still apply.
export async function verifyTurnstile(token: string, ip: string): Promise<TurnstileResult> {
  if (!token || token.length > 2048) return "failed";

  const body = new URLSearchParams({ secret: requiredEnv("TURNSTILE_SECRET_KEY"), response: token, remoteip: ip });
  let data: VerifyResponse;
  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) return "unverified";
    data = (await response.json()) as VerifyResponse;
  } catch {
    return "unverified";
  }

  if (data.success === true) return "passed";
  return data["error-codes"]?.includes("internal-error") ? "unverified" : "failed";
}
