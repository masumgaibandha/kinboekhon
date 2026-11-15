import { z } from "zod";

import { BENEFIT_ICON_KEYS, MAX_BENEFITS } from "@/lib/landing/benefit-icons";
import { videoEmbed } from "@/lib/landing/video";
import { IMAGE_LIMITS } from "@/lib/product-images";
import { faqListSchema } from "@/lib/validation/home-content";
import { imageListField, singleImageField } from "@/lib/validation/image";
import { lines, text } from "@/lib/validation/product";

const benefits = z
  .array(z.object({ icon: z.enum(BENEFIT_ICON_KEYS, { error: "Choose an icon." }), text: text(150) }))
  .max(MAX_BENEFITS, `Up to ${MAX_BENEFITS} benefits.`)
  .transform((rows) => rows.filter((row) => row.text));

// One spec per line as "Label: value", split at the first colon.
const specRows = lines(20)
  .refine((rows) => rows.every((row) => row.includes(":")), "Write each line as Label: value.")
  .transform((rows) =>
    rows.map((row) => {
      const at = row.indexOf(":");
      return { label: row.slice(0, at).trim(), value: row.slice(at + 1).trim() };
    }),
  );

export const landingSchema = z.object({
  active: z.boolean(),
  headline: text(150),
  subheadline: text(300),
  heroImage: singleImageField("landing"),
  heroVideoUrl: text(300).refine((url) => url === "" || videoEmbed(url) !== null, "Use a YouTube or Facebook video link."),
  problem: z.object({ title: text(150), points: lines(10) }),
  solution: z.object({ title: text(150), text: text(1500) }),
  benefits: z.object({ title: text(150), items: benefits }),
  gallery: z.object({ title: text(150), images: imageListField("landing", IMAGE_LIMITS["gallery.images"]) }),
  howTo: z.object({ title: text(150), steps: lines(10) }),
  inBox: z.object({ title: text(150), items: lines(15) }),
  specs: z.object({ title: text(150), rows: specRows }),
  guarantee: text(200),
  faq: faqListSchema,
});

export type LandingValues = z.output<typeof landingSchema>;

export function readLandingForm(formData: FormData) {
  const value = (name: string) => String(formData.get(name) ?? "");
  const all = (name: string) => formData.getAll(name).map(String);
  const icons = all("benefits.icon");
  const answers = all("faq.answer");
  const section = (name: string, field: string) => ({ title: value(`${name}.title`), [field]: value(`${name}.${field}`) });

  return {
    active: formData.get("active") === "on",
    headline: value("headline"),
    subheadline: value("subheadline"),
    heroImage: value("heroImage"),
    heroVideoUrl: value("heroVideoUrl"),
    problem: section("problem", "points"),
    solution: section("solution", "text"),
    benefits: { title: value("benefits.title"), items: all("benefits.text").map((item, index) => ({ icon: icons[index] ?? "", text: item })) },
    gallery: section("gallery", "images"),
    howTo: section("howTo", "steps"),
    inBox: section("inBox", "items"),
    specs: section("specs", "rows"),
    guarantee: value("guarantee"),
    faq: all("faq.question").map((question, index) => ({ question, answer: answers[index] ?? "" })),
  };
}
