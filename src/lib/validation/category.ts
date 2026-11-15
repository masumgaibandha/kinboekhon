import { z } from "zod";

import { singleImageField } from "@/lib/validation/image";
import { SLUG_PATTERN } from "@/lib/validation/product";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Required.").max(60, "Keep it under 60 characters."),
  slug: z
    .string()
    .trim()
    .min(1, "Required.")
    .max(60, "Keep it under 60 characters.")
    .regex(SLUG_PATTERN, "Use lowercase English letters, numbers and single hyphens."),
  image: singleImageField("categories"),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Enter a whole number from 0 to 9999.")
    .transform(Number),
});

export type CategoryValues = z.output<typeof categorySchema>;

export function readCategoryForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return { name: text("name"), slug: text("slug"), image: text("image"), sortOrder: text("sortOrder") };
}
