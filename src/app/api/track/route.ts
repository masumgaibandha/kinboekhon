import { after, type NextRequest } from "next/server";

import { connectMongoose } from "@/lib/db";
import { adTracking } from "@/lib/meta/ad-tracking";
import { sendCapiEvent } from "@/lib/meta/capi";
import { browserUserData } from "@/lib/meta/user-data";
import { ProductModel } from "@/lib/models/Product";
import { TRACK_IP_WINDOWS, takeRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin, userAgent } from "@/lib/request";
import { trackSchema } from "@/lib/validation/track";

const MAX_BODY_BYTES = 1024;

// The shop never shows these replies.
function reply(status: number) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  try {
    if (!(await takeRateLimit("track", hashIp(ip), TRACK_IP_WINDOWS))) return reply(429);
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
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return reply(400);
  const { event, eventId, productId, quantity } = parsed.data;

  try {
    await connectMongoose();
    const product = await ProductModel.findOne({ _id: productId, active: true }, { name: 1, price: 1 }).lean<{
      name: string;
      price: number;
    }>();
    if (!product) return reply(404);

    const ad = adTracking(request);
    const facts = { ip, userAgent: userAgent(request), fbp: ad.fbp, fbc: ad.fbc };
    after(() =>
      sendCapiEvent({
        event_name: event,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: ad.sourceUrl,
        action_source: "website",
        user_data: browserUserData(facts),
        custom_data: {
          content_ids: [productId],
          content_name: product.name,
          content_type: "product",
          currency: "BDT",
          value: product.price * quantity,
          num_items: quantity,
        },
      }),
    );
    return reply(204);
  } catch {
    return reply(500);
  }
}
