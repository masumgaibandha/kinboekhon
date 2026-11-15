import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

import { applyPathaoUpdate } from "@/lib/pathao/apply-update";
import { WEBHOOK_REPLY_HEADER, WEBHOOK_REPLY_VALUE } from "@/lib/pathao/config";
import { statusSlug } from "@/lib/pathao/status-map";
import { pathaoWebhookSchema } from "@/lib/validation/pathao";

const MAX_BODY_BYTES = 8 * 1024;

function reply(status: number) {
  return new Response(null, { status, headers: { [WEBHOOK_REPLY_HEADER]: WEBHOOK_REPLY_VALUE, "Cache-Control": "no-store" } });
}

const digest = (value: string) => createHash("sha256").update(value).digest();

// Pathao sends the secret we gave it in X-PATHAO-Signature.
function signed(request: NextRequest): boolean {
  const secret = process.env.PATHAO_WEBHOOK_SECRET;
  const sent = request.headers.get("x-pathao-signature");
  return Boolean(secret && sent && timingSafeEqual(digest(sent), digest(secret)));
}

export async function POST(request: NextRequest) {
  if (!signed(request)) return reply(401);
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return reply(413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400);
  }
  const parsed = pathaoWebhookSchema.safeParse(body);
  // Integration checks and store events have no consignment: accept them and do nothing.
  if (!parsed.success || !parsed.data.consignment_id || !parsed.data.event) return reply(202);

  const { consignment_id, event, timestamp, delivery_fee, reason } = parsed.data;
  try {
    await applyPathaoUpdate({
      consignmentId: consignment_id,
      slug: statusSlug(event),
      at: timestamp ?? new Date(),
      deliveryFee: delivery_fee,
      reason,
    });
  } catch {
    return reply(500);
  }
  return reply(202);
}
