"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath, updateTag } from "next/cache";

import { adminFail, FIX_FIELDS, TRY_AGAIN, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { requireAdmin } from "@/lib/admin-session";
import { CATEGORIES_TAG } from "@/lib/categories/shop";
import { connectMongoose } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import { isDuplicateKey } from "@/lib/mongo-errors";
import { categorySchema, readCategoryForm, type CategoryValues } from "@/lib/validation/category";

const NOT_FOUND = adminFail("Category not found.");

async function saveCategory(formData: FormData, write: (values: CategoryValues) => Promise<boolean>, done: string) {
  const parsed = categorySchema.safeParse(readCategoryForm(formData));
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await connectMongoose();
    if (!(await write(parsed.data))) return NOT_FOUND;
  } catch (error) {
    if (isDuplicateKey(error)) return adminFail(FIX_FIELDS, { slug: "This slug is already used by another category." });
    return adminFail(TRY_AGAIN);
  }
  updateTag(CATEGORIES_TAG);
  revalidatePath("/admin", "layout");
  return { ok: true, message: done } satisfies AdminActionResult;
}

export async function createCategory(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  return saveCategory(formData, async (values) => Boolean(await CategoryModel.create(values)), "Category created.");
}

export async function updateCategory(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!isValidObjectId(id)) return NOT_FOUND;
  return saveCategory(
    formData,
    async (values) => (await CategoryModel.updateOne({ _id: id }, { $set: values })).matchedCount === 1,
    "Category saved.",
  );
}
