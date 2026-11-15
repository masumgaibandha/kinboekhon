"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath, updateTag } from "next/cache";

import { adminFail, TRY_AGAIN, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { requireAdmin } from "@/lib/admin-session";
import { changedFields, INITIAL_VALUES_FIELD, readJsonField } from "@/lib/changed-fields";
import { connectMongoose } from "@/lib/db";
import { LANDINGS_TAG, landingTag } from "@/lib/landing/landing-pages";
import { LandingPageModel } from "@/lib/models/LandingPage";
import { ProductModel } from "@/lib/models/Product";
import { landingSchema, readLandingForm, type LandingValues } from "@/lib/validation/landing";

// Saves the product's ad landing page. Only sections the admin changed are written, so a stale form never turns it On or Off.
export async function saveLanding(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  if (!isValidObjectId(productId)) return adminFail("Product not found.");
  const parsed = landingSchema.safeParse(readLandingForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const initial = readJsonField(formData, INITIAL_VALUES_FIELD);
  if (!initial) return adminFail("This page is out of date. Reload it and try again.");

  // A changed leaf writes its whole section, which also works when the saved value is still null.
  const sections = new Set(Object.keys(changedFields(parsed.data, initial)).map((path) => path.split(".")[0] as keyof LandingValues));
  if (sections.size === 0) return { ok: true, message: "No changes to save." };
  const changes = Object.fromEntries([...sections].map((key) => [key, parsed.data[key]]));

  try {
    await connectMongoose();
    if (!(await ProductModel.exists({ _id: productId }))) return adminFail("Product not found.");
    await LandingPageModel.updateOne({ productId }, { $set: changes }, { upsert: true });
  } catch {
    return adminFail(TRY_AGAIN);
  }
  updateTag(landingTag(productId));
  updateTag(LANDINGS_TAG);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Landing page saved." };
}
