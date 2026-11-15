import { connectMongoose } from "@/lib/db";
import { PathaoTokenModel } from "@/lib/models/PathaoToken";
import type { PathaoConfig } from "@/lib/pathao/config";

const TOKEN_PATH = "/aladdin/api/v1/issue-token";
const TIMEOUT_MS = 15000;
// Refresh a day early, so a token never runs out in the middle of a send.
const REFRESH_EARLY_MS = 24 * 60 * 60 * 1000;

const accountOf = (config: PathaoConfig) => `${config.baseUrl}|${config.clientId}`;

interface IssuedToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

async function issueToken(config: PathaoConfig, grant: Record<string, string>): Promise<IssuedToken | null> {
  const response = await fetch(config.baseUrl + TOKEN_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, ...grant }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const expiresIn = Number(body?.expires_in);
  if (typeof body?.access_token !== "string" || typeof body.refresh_token !== "string" || !(expiresIn > 0)) return null;
  return { accessToken: body.access_token, refreshToken: body.refresh_token, expiresAt: new Date(Date.now() + expiresIn * 1000) };
}

// A saved token while it is fresh; otherwise a refreshed one, or a new one from the account login.
export async function getAccessToken(config: PathaoConfig, forceNew = false): Promise<string> {
  await connectMongoose();
  const account = accountOf(config);
  const saved = await PathaoTokenModel.findOne({ account }).lean();
  if (saved && !forceNew && saved.expiresAt.getTime() - Date.now() > REFRESH_EARLY_MS) return saved.accessToken;

  let token = saved ? await issueToken(config, { grant_type: "refresh_token", refresh_token: saved.refreshToken }) : null;
  token ??= await issueToken(config, { grant_type: "password", username: config.username, password: config.password });
  if (!token) throw new Error("pathao_token");

  await PathaoTokenModel.updateOne({ account }, { $set: token }, { upsert: true });
  return token.accessToken;
}
