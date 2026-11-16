import type { NextRequest } from "next/server";

import { saveCallback } from "@/lib/drafts/save-callback";
import { CALLBACK_IP_WINDOWS, takeRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin, userAgent } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { callbackSchema } from "@/lib/validation/callback";

const MAX_BODY_BYTES = 4096;

const TOO_MANY = "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
const CHECK_FAILED = "নিরাপত্তা যাচাই সফল হয়নি। পেজটি আবার লোড করে চেষ্টা করুন।";
const TRY_AGAIN = "নম্বরটি পাঠানো যায়নি। একটু পরে আবার চেষ্টা করুন।";

function reply(status: number, message?: string) {
  return Response.json(message ? { message } : {}, { status, headers: { "Cache-Control": "no-store" } });
}

// A number from the help popup: saved as a Callback request in the admin's incomplete orders.
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const ipHash = hashIp(ip);
  try {
    if (!(await takeRateLimit("callback", ipHash, CALLBACK_IP_WINDOWS))) return reply(429, TOO_MANY);
  } catch {
    return reply(500, TRY_AGAIN);
  }

  if (!isSameOrigin(request)) return reply(403, TRY_AGAIN);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415, TRY_AGAIN);
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return reply(413, TRY_AGAIN);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400, TRY_AGAIN);
  }
  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    const phoneIssue = parsed.error.issues.find((issue) => issue.path[0] === "phone");
    return reply(400, phoneIssue?.message ?? TRY_AGAIN);
  }

  // Cloudflare unreachable ("unverified") still saves the request, as with orders.
  if ((await verifyTurnstile(parsed.data.turnstileToken, ip)) === "failed") return reply(403, CHECK_FAILED);

  try {
    const sourceUrl = (request.headers.get("referer") ?? "").slice(0, 500);
    const saved = await saveCallback(parsed.data.productId, parsed.data.phone, { ipHash, userAgent: userAgent(request), sourceUrl });
    return saved ? reply(200) : reply(409, TRY_AGAIN);
  } catch {
    return reply(500, TRY_AGAIN);
  }
}
