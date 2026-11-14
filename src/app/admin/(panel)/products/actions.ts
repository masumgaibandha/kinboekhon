"use server";

import { isValidObjectId } from "mongoose";
import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { PRODUCTS_TAG, productTag } from "@/lib/catalog";
import { connectMongoose } from "@/lib/db";
import { activeWasChanged } from "@/lib/product-form";
import { ProductModel } from "@/lib/models/Product";
import { PRODUCT_COST_KEYS, readCostFields } from "@/lib/validation/costs";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";

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
    costs: readCostFields(formData, "costs", PRODUCT_COST_KEYS),
  };
}

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function saveProduct(
  formData: FormData,
  write: (product: ProductFormValues) => Promise<string | null>,
): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] ??= issue.message;
    }
    return { ok: false, message: FIX_FIELDS, fieldErrors };
  }

  let previousSlug: string | null;
  try {
    await connectMongoose();
    previousSlug = await write(parsed.data);
    if (previousSlug === null) return NOT_FOUND;
  } catch (error) {
    if (isDuplicateKey(error)) {
      return { ok: false, message: FIX_FIELDS, fieldErrors: { slug: "This slug is already used by another product." } };
    }
    return { ok: false, message: "Could not save the product. Try again.", fieldErrors: {} };
  }
  refreshShop(previousSlug, parsed.data.slug);
  return { ok: true };
}

// Home grid plus the landing pages under the old and new slug.
function refreshShop(...slugs: string[]) {
  updateTag(PRODUCTS_TAG);
  for (const slug of new Set(slugs)) updateTag(productTag(slug));
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  await requireAdmin();
  return saveProduct(formData, async (product) => {
    await ProductModel.create(product);
    return product.slug;
  });
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) return NOT_FOUND;
  // A stale form or a second tab must never flip Active, so it is written only when changed on purpose.
  const writeActive = activeWasChanged(formData);
  return saveProduct(formData, async ({ active, ...rest }) => {
    const changes = writeActive ? { ...rest, active } : rest;
    const before = await ProductModel.findOneAndUpdate({ _id: id }, { $set: changes }, { projection: { slug: 1 } })
      .lean<{ slug: string }>();
    return before?.slug ?? null;
  });
}

export async function setProductActive(id: string, active: boolean): Promise<ProductActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id) || typeof active !== "boolean") return NOT_FOUND;

  try {
    await connectMongoose();
    const product = await ProductModel.findOneAndUpdate({ _id: id }, { $set: { active } }, { projection: { slug: 1 } })
      .lean<{ slug: string }>();
    if (!product) return NOT_FOUND;
    refreshShop(product.slug);
  } catch {
    return { ok: false, message: "Could not update the product. Try again.", fieldErrors: {} };
  }
  return { ok: true };
}
