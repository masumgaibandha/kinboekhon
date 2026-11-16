"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { saveCampaignProduct } from "@/lib/meta-ads/campaign-products";
import { syncMetaInsights } from "@/lib/meta-ads/sync-insights";
import { campaignProductSchema } from "@/lib/validation/campaign-product";

export async function syncMetaAdsAction(): Promise<AdminActionResult> {
  await requireAdmin();
  const result = await syncMetaInsights("manual");
  revalidatePath("/admin/ads");
  if (!result.ok) return adminFail(result.error);
  return { ok: true, message: `Synced ${result.rows} ad ${result.rows === 1 ? "day" : "days"} from Meta.` };
}

export async function saveCampaignProductAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = campaignProductSchema.safeParse({
    campaignId: String(formData.get("campaignId") ?? ""),
    productId: String(formData.get("productId") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const result = await saveCampaignProduct(parsed.data.campaignId, parsed.data.productId);
  if (result.ok) revalidatePath("/admin/ads");
  return result;
}
