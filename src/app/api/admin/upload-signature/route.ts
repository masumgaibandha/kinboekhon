import { z } from "zod";

import { requireAdminApi } from "@/lib/admin-session";
import { IMAGE_KINDS } from "@/lib/cloudinary/folder";
import { signImageUpload } from "@/lib/cloudinary/sign";

const NO_STORE = { "Cache-Control": "no-store" };

// The image kind picks the folder; no body means a product image.
const bodySchema = z.object({ kind: z.enum(IMAGE_KINDS).default("products") });

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const text = await request.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    return Response.json({ error: "BAD_REQUEST" }, { status: 400, headers: NO_STORE });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "BAD_REQUEST" }, { status: 400, headers: NO_STORE });
  return Response.json(signImageUpload(parsed.data.kind), { headers: NO_STORE });
}
