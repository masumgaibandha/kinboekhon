import { pathaoConfig, type PathaoConfig } from "@/lib/pathao/config";
import { getAccessToken } from "@/lib/pathao/token";

const TIMEOUT_MS = 20000;

export interface PathaoResponse {
  status: number;
  body: Record<string, unknown> | null;
}

// The request may or may not have reached Pathao (timeout or network error).
export class PathaoUnreachable extends Error {
  constructor(public code: "timeout" | "network" | "pathao_token") {
    super(code);
  }
}

async function send(config: PathaoConfig, path: string, init: { method: string; body?: unknown }, token: string) {
  const response = await fetch(config.baseUrl + path, {
    method: init.method,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: response.status, body };
}

// One Pathao API call; a refused token is replaced once.
export async function pathaoRequest(path: string, init: { method: string; body?: unknown } = { method: "GET" }): Promise<PathaoResponse> {
  const config = pathaoConfig();
  if (!config) throw new Error("pathao_not_connected");
  try {
    const result = await send(config, path, init, await getAccessToken(config));
    if (result.status !== 401) return result;
    return await send(config, path, init, await getAccessToken(config, true));
  } catch (error) {
    if (error instanceof Error && error.message === "pathao_token") throw new PathaoUnreachable("pathao_token");
    throw new PathaoUnreachable(error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network");
  }
}

// The `data` object of a Pathao reply.
export function dataOf(response: PathaoResponse): Record<string, unknown> {
  const data = response.body?.data;
  return data !== null && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

// Pathao's own error text, short, for the admin.
export function pathaoError(response: PathaoResponse): string {
  const errors = response.body?.errors;
  const details =
    errors && typeof errors === "object"
      ? Object.values(errors as Record<string, unknown>).flat().filter((item): item is string => typeof item === "string")
      : [];
  const message = typeof response.body?.message === "string" ? response.body.message : "";
  const text = details.length > 0 ? details.join(" ") : message || `HTTP ${response.status}`;
  return text.slice(0, 200);
}
