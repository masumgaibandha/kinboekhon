import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);

const lines = (maxItems: number) =>
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
    oldPrice: z
      .string()
      .trim()
      .regex(/^(\d{1,6})?$/, "Enter a whole amount in taka, or leave it empty.")
      .transform((value) => (value === "" ? null : Number(value))),
    shortDescription: text(300),
    sortOrder: z
      .string()
      .trim()
      .regex(/^\d{1,4}$/, "Enter a whole number from 0 to 9999.")
      .transform(Number),
    active: z.boolean(),
    hook: z.object({ headline: text(150), subheadline: text(300) }),
    problem: z.object({ title: text(150), points: lines(10) }),
    story: z.object({ title: text(150), body: text(2000) }),
    solution: z.object({ title: text(150), benefits: lines(10) }),
    proof: z.object({ title: text(150), reviews }),
    cta: z.object({ title: text(150), text: text(300) }),
  })
  .superRefine((product, ctx) => {
    const { price, oldPrice } = product;
    if (!Number.isInteger(price) || oldPrice === null || !Number.isInteger(oldPrice)) return;
    if (oldPrice <= price) {
      ctx.addIssue({ code: "custom", path: ["oldPrice"], message: "Old price must be higher than the price." });
    }
  });

export type ProductInput = z.output<typeof productSchema>;
