import type { NextRequest } from "next/server";

import { findOrderStatus } from "@/lib/orders/order-status";
import { ORDER_STATUS_IP_WINDOWS, takeRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";
import { orderStatusSchema } from "@/lib/validation/order-status";

const MAX_BODY_BYTES = 512;
const TRY_AGAIN = "কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।";
const NOT_FOUND = "এই অর্ডার নম্বর ও মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি। দুটোই আবার দেখে নিন।";

function reply(status: number, body: object) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    if (!(await takeRateLimit("order-status", hashIp(clientIp(request)), ORDER_STATUS_IP_WINDOWS))) {
      return reply(429, { message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" });
    }
  } catch {
    return reply(500, { message: TRY_AGAIN });
  }

  if (!isSameOrigin(request)) return reply(403, { message: TRY_AGAIN });
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return reply(413, { message: TRY_AGAIN });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400, { message: TRY_AGAIN });
  }
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return reply(400, { fieldErrors });
  }

  try {
    const order = await findOrderStatus(parsed.data);
    return order ? reply(200, { order }) : reply(404, { message: NOT_FOUND });
  } catch {
    return reply(500, { message: TRY_AGAIN });
  }
}
