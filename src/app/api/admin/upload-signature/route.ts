import { requireAdminApi } from "@/lib/admin-session";
import { signProductImageUpload } from "@/lib/cloudinary/sign";

export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  return Response.json(signProductImageUpload(), { headers: { "Cache-Control": "no-store" } });
}
