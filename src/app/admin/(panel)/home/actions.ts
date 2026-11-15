"use server";

import { revalidatePath, updateTag } from "next/cache";

import { adminFail, TRY_AGAIN, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { requireAdmin } from "@/lib/admin-session";
import { connectMongoose } from "@/lib/db";
import { HOME_KEY, HOME_TAG } from "@/lib/home/home-content";
import { HomeContentModel } from "@/lib/models/HomeContent";
import { homeContentSchema, readHomeContentForm } from "@/lib/validation/home-content";

export async function saveHomeContent(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = homeContentSchema.safeParse(readHomeContentForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await connectMongoose();
    await HomeContentModel.updateOne({ key: HOME_KEY }, { $set: parsed.data }, { upsert: true });
  } catch {
    return adminFail(TRY_AGAIN);
  }
  updateTag(HOME_TAG);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Home page saved." };
}
