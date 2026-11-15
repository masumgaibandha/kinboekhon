import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { MAX_EXTRAS } from "@/lib/orders/limits";
import { IMAGE_LIMITS } from "@/lib/product-images";
import { productCostsSchema } from "@/lib/validation/costs";
import { imageListField } from "@/lib/validation/image";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);

export const lines = (maxItems: number) =>
  z
    .string()
    .transform((value) =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .refine((items) => items.length <= maxItems, `Up to ${maxItems} lines.`)
    .refine((items) => items.every((item) => item.length <= 200), "Keep each line under 200 characters.");

const reviews = z
  .array(z.object({ name: text(60), text: text(500) }))
  .max(20, "Up to 20 reviews.")
  .superRefine((rows, ctx) => {
    rows.forEach((row, index) => {
      if (row.name && !row.text) {
        ctx.addIssue({ code: "custom", path: [index, "text"], message: "Add the review text or remove this row." });
      }
    });
  })
  .transform((rows) => rows.filter((row) => row.text));

const imageList = (max: number) => imageListField("products", max);

export const productSchema = z
  .object({
    name: text(120).min(1, "Required."),
    slug: z
      .string()
      .trim()
      .min(1, "Required.")
      .max(80, "Keep it under 80 characters.")
      .regex(SLUG_PATTERN, "Use lowercase English letters, numbers and single hyphens."),
    price: z
      .string()
      .trim()
      .regex(/^\d{1,6}$/, "Enter a whole amount in taka.")
      .transform(Number)
      .refine((price) => price > 0, "Price must be more than 0."),
    shortDescription: text(300),
    sortOrder: z
      .string()
      .trim()
      .regex(/^\d{1,4}$/, "Enter a whole number from 0 to 9999.")
      .transform(Number),
    active: z.boolean(),
    // Empty means no category.
    categoryId: z
      .string()
      .trim()
      .refine((id) => id === "" || isValidObjectId(id), "Choose a category from the list.")
      .transform((id) => id || null),
    popular: z.boolean(),
    // "এটাও নিন" products shown in the order summary, in this order; none means the same category's products.
    upsellIds: z
      .array(z.string().trim())
      .transform((ids) => ids.filter(Boolean))
      .pipe(
        z
          .array(z.string().refine(isValidObjectId, "Choose a product from the list."))
          .max(MAX_EXTRAS, `Pick up to ${MAX_EXTRAS} products.`)
          .refine((ids) => new Set(ids).size === ids.length, "Pick each product once."),
      ),
    images: imageList(IMAGE_LIMITS.images),
    hook: z.object({ headline: text(150), subheadline: text(300) }),
    problem: z.object({ title: text(150), points: lines(10) }),
    story: z.object({ title: text(150), body: text(2000) }),
    solution: z.object({
      title: text(150),
      benefits: lines(10),
      images: imageList(IMAGE_LIMITS["solution.images"]),
    }),
    proof: z.object({ title: text(150), images: imageList(IMAGE_LIMITS["proof.images"]), reviews }),
    cta: z.object({ title: text(150), text: text(300) }),
  });

// Admin form: the product plus its price calculator inputs, which never reach the shop.
export const productFormSchema = productSchema.extend({ costs: productCostsSchema });

export type ProductInput = z.output<typeof productSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
