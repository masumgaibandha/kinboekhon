import { z } from "zod";

import { requiredImageField } from "@/lib/validation/image";

// A page on this site ("/c/kitchen") or a full https link. Empty means the banner is not a link.
const INTERNAL_PATH = /^\/(?!\/)[A-Za-z0-9\-._~/?=&%#]*$/;

const link = z
  .string()
  .trim()
  .max(300, "Keep it under 300 characters.")
  .refine(
    (value) => value === "" || INTERNAL_PATH.test(value) || z.url({ protocol: /^https$/ }).safeParse(value).success,
    "Use a page path like /c/kitchen or a full https:// link.",
  );

export const bannerSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(100, "Keep it under 100 characters."),
  link,
  mobileImage: requiredImageField("banners"),
  desktopImage: requiredImageField("banners"),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Enter a whole number from 0 to 9999.")
    .transform(Number),
  active: z.boolean(),
});

export type BannerValues = z.output<typeof bannerSchema>;

export function readBannerForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    title: text("title"),
    link: text("link"),
    mobileImage: text("mobileImage"),
    desktopImage: text("desktopImage"),
    sortOrder: text("sortOrder"),
    active: formData.get("active") === "on",
  };
}
