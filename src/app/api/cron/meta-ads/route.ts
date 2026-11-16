import { createHash, timingSafeEqual } from "node:crypto";

import { syncMetaInsights } from "@/lib/meta-ads/sync-insights";

export const maxDuration = 60;

const digest = (value: string) => createHash("sha256").update(value).digest();

// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
function fromCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const sent = request.headers.get("authorization");
  return Boolean(secret && sent && timingSafeEqual(digest(sent), digest(`Bearer ${secret}`)));
}

// Daily Meta Ads import, at 02:00 Dhaka time (20:00 UTC) from vercel.json.
export async function GET(request: Request): Promise<Response> {
  if (!fromCron(request)) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const result = await syncMetaInsights("cron");
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
