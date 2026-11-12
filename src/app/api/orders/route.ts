import type { NextRequest } from "next/server";

import { createOrder } from "@/lib/orders/create-order";
import { ORDER_IP_WINDOWS, takeRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin, userAgent } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { orderSchema } from "@/lib/validation/order";

// Room for the Bangla fields and a Turnstile token (up to 2,048 characters).
const MAX_BODY_BYTES = 8192;
const SHOWN_FIELDS = new Set([
  "name",
  "phone",
  "cityCorporation",
  "divisionId",
  "districtId",
  "upazilaId",
  "address",
  "paymentMethod",
  "senderNumber",
  "transactionId",
]);
const TRY_AGAIN = "অর্ডার নেওয়া যায়নি। একটু পরে আবার চেষ্টা করুন।";
const RATE_LIMITED = "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
const CHECK_FAILED = "নিরাপত্তা যাচাই সফল হয়নি। পেজটি আবার লোড করে চেষ্টা করুন।";

function tokenOf(body: unknown): string {
  if (typeof body !== "object" || body === null || !("turnstileToken" in body)) return "";
  return typeof body.turnstileToken === "string" ? body.turnstileToken : "";
}

function reply(body: object, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ message: TRY_AGAIN }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ message: TRY_AGAIN }, 415);

  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return reply({ message: TRY_AGAIN }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ message: TRY_AGAIN }, 400);
  }

  // Every attempt counts, so a bot can't keep trying with new form data.
  const ip = clientIp(request);
  const ipHash = hashIp(ip);
  try {
    if (!(await takeRateLimit("order", ipHash, ORDER_IP_WINDOWS))) return reply({ message: RATE_LIMITED }, 429);
  } catch {
    return reply({ message: TRY_AGAIN }, 500);
  }

  const turnstile = await verifyTurnstile(tokenOf(body), ip);
  if (turnstile === "failed") return reply({ message: CHECK_FAILED }, 403);

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    // Quantity, area and product have no message of their own on the form, so their error becomes the main message.
    const unshown = Object.entries(fieldErrors).find(([field]) => !SHOWN_FIELDS.has(field));
    return reply({ message: unshown ? unshown[1] : "চিহ্নিত ঘরগুলো ঠিক করুন।", fieldErrors }, 400);
  }

  try {
    const result = await createOrder(parsed.data, { ip, ipHash, userAgent: userAgent(request), turnstile });
    if (!result.ok) return reply({ message: result.message, fieldErrors: result.fieldErrors ?? {} }, 409);
    return reply({ publicId: result.publicId }, 201);
  } catch {
    return reply({ message: TRY_AGAIN }, 500);
  }
}
