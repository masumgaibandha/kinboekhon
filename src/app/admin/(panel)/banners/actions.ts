"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath, updateTag } from "next/cache";

import { adminFail, TRY_AGAIN, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { requireAdmin } from "@/lib/admin-session";
import { BANNERS_TAG } from "@/lib/banners/shop";
import { changedFields, INITIAL_VALUES_FIELD, readJsonField } from "@/lib/changed-fields";
import { connectMongoose } from "@/lib/db";
import { BannerModel } from "@/lib/models/Banner";
import { bannerSchema, readBannerForm } from "@/lib/validation/banner";

const NOT_FOUND = adminFail("Banner not found.");

function refreshed(message: string): AdminActionResult {
  updateTag(BANNERS_TAG);
  revalidatePath("/admin", "layout");
  return { ok: true, message };
}

export async function createBanner(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(readBannerForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await connectMongoose();
    await BannerModel.create(parsed.data);
  } catch {
    return adminFail(TRY_AGAIN);
  }
  return refreshed("Banner created.");
}

// Writes only what the admin changed, so a stale form never flips On/Off or swaps an image.
export async function updateBanner(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!isValidObjectId(id)) return NOT_FOUND;
  const parsed = bannerSchema.safeParse(readBannerForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const initial = readJsonField(formData, INITIAL_VALUES_FIELD);
  if (!initial) return adminFail("This page is out of date. Reload it and try again.");

  const changes = changedFields(parsed.data, initial);
  if (Object.keys(changes).length === 0) return { ok: true, message: "No changes to save." };
  try {
    await connectMongoose();
    const result = await BannerModel.updateOne({ _id: id }, { $set: changes });
    if (result.matchedCount !== 1) return NOT_FOUND;
  } catch {
    return adminFail(TRY_AGAIN);
  }
  return refreshed("Banner saved.");
}
