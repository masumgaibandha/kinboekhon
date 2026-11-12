import type { NextRequest } from "next/server";

import { createOrder } from "@/lib/orders/create-order";
import { isSameOrigin } from "@/lib/request";
import { orderSchema } from "@/lib/validation/order";

const MAX_BODY_BYTES = 4096;
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

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    // Quantity, area and product have no message of their own on the form, so their error becomes the main message.
    const unshown = Object.entries(fieldErrors).find(([field]) => !SHOWN_FIELDS.has(field));
    return reply({ message: unshown ? unshown[1] : "চিহ্নিত ঘরগুলো ঠিক করুন।", fieldErrors }, 400);
  }

  try {
    const result = await createOrder(parsed.data);
    if (!result.ok) return reply({ message: result.message, fieldErrors: result.fieldErrors ?? {} }, 409);
    return reply({ publicId: result.publicId }, 201);
  } catch {
    return reply({ message: TRY_AGAIN }, 500);
  }
}
