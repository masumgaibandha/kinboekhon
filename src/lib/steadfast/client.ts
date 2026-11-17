// Steadfast official API (docs: https://documenter.getpostman.com/view/26211192/2sAYJ1mhpk). It has no sandbox: the keys are live.
const BASE_URL = "https://portal.packzy.com/api/v1";
const TIMEOUT_MS = 5000;

// The only calls allowed outside production. Each is a GET that never changes the Steadfast account.
const READ_ONLY_PATHS = [/^\/fraud_check\/\d+$/,/^\/get_balance$/];

export class SteadfastBlockedError extends Error {
  constructor(method: string, path: string) {
    super(`Steadfast ${method} ${path} is blocked: outside production only fraud_check and get_balance may be called.`);
    this.name = "SteadfastBlockedError";
  }
}

export function steadfastKeys(): { apiKey: string; secretKey: string } | null {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  return apiKey && secretKey ? { apiKey, secretKey } : null;
}

// Throws unless NODE_ENV is production or the call is one of the read-only GETs.
export function assertSteadfastCallAllowed(method: string, path: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (method.toUpperCase() === "GET" && READ_ONLY_PATHS.some((pattern) => pattern.test(path))) return;
  throw new SteadfastBlockedError(method, path);
}

// Every Steadfast call goes through here, so the guard always runs before anything is sent.
export async function steadfastRequest(method: string, path: string, body?: unknown): Promise<Response> {
  assertSteadfastCallAllowed(method, path);
  const auth = steadfastKeys();
  if (!auth) throw new Error("Steadfast API keys are not set.");
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Api-Key": auth.apiKey,
      "Secret-Key": auth.secretKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
}
