"use server";

import { isValidObjectId } from "mongoose";

import { requireAdmin } from "@/lib/admin-session";
import { connectMongoose } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { productSchema, type ProductInput } from "@/lib/validation/product";

export type ProductActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

const FIX_FIELDS = "Please fix the highlighted fields.";
const NOT_FOUND: ProductActionResult = { ok: false, message: "Product not found.", fieldErrors: {} };

function readForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  const reviewNames = formData.getAll("reviews.name").map(String);
  const reviewTexts = formData.getAll("reviews.text").map(String);

  return {
    name: text("name"),
    slug: text("slug"),
    price: text("price"),
    oldPrice: text("oldPrice"),
    shortDescription: text("shortDescription"),
    sortOrder: text("sortOrder"),
    active: formData.get("active") === "on",
    images: text("images"),
    hook: { headline: text("hook.headline"), subheadline: text("hook.subheadline") },
    problem: { title: text("problem.title"), points: text("problem.points") },
    story: { title: text("story.title"), body: text("story.body") },
    solution: {
      title: text("solution.title"),
      benefits: text("solution.benefits"),
      images: text("solution.images"),
    },
    proof: {
      title: text("proof.title"),
      images: text("proof.images"),
      reviews: reviewNames.map((name, index) => ({ name, text: reviewTexts[index] ?? "" })),
    },
    cta: { title: text("cta.title"), text: text("cta.text") },
  };
}

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function saveProduct(
  formData: FormData,
  write: (product: ProductInput) => Promise<boolean>,
): Promise<ProductActionResult> {
  const parsed = productSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] ??= issue.message;
    }
    return { ok: false, message: FIX_FIELDS, fieldErrors };
  }

  try {
    await connectMongoose();
    if (!(await write(parsed.data))) return NOT_FOUND;
  } catch (error) {
    if (isDuplicateKey(error)) {
      return { ok: false, message: FIX_FIELDS, fieldErrors: { slug: "This slug is already used by another product." } };
    }
    return { ok: false, message: "Could not save the product. Try again.", fieldErrors: {} };
  }
  return { ok: true };
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  await requireAdmin();
  return saveProduct(formData, async (product) => {
    await ProductModel.create(product);
    return true;
  });
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) return NOT_FOUND;
  return saveProduct(formData, async (product) => {
    const result = await ProductModel.updateOne({ _id: id }, { $set: product });
    return result.matchedCount === 1;
  });
}

export async function setProductActive(id: string, active: boolean): Promise<ProductActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id) || typeof active !== "boolean") return NOT_FOUND;

  try {
    await connectMongoose();
    const result = await ProductModel.updateOne({ _id: id }, { $set: { active } });
    if (result.matchedCount !== 1) return NOT_FOUND;
  } catch {
    return { ok: false, message: "Could not update the product. Try again.", fieldErrors: {} };
  }
  return { ok: true };
}
