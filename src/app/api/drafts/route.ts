import type { NextRequest } from "next/server";

import { saveDraft } from "@/lib/drafts/save-draft";
import { DRAFT_IP_WINDOWS, takeRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin, userAgent } from "@/lib/request";
import { draftSchema } from "@/lib/validation/draft";

const MAX_BODY_BYTES = 4096;

// The customer never sees these replies; the form keeps working whatever happens here.
function reply(status: number) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const ipHash = hashIp(clientIp(request));
  try {
    if (!(await takeRateLimit("draft", ipHash, DRAFT_IP_WINDOWS))) return reply(429);
  } catch {
    return reply(500);
  }

  if (!isSameOrigin(request)) return reply(403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415);
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return reply(413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400);
  }
  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) return reply(400);

  try {
    const sourceUrl = (request.headers.get("referer") ?? "").slice(0, 500);
    await saveDraft(parsed.data, { ipHash, userAgent: userAgent(request), sourceUrl });
    return reply(204);
  } catch {
    return reply(500);
  }
}
