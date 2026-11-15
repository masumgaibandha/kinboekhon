import { z } from "zod";

import { singleImageField } from "@/lib/validation/image";

export const TRUST_ITEMS = 4;
export const MAX_FAQ = 15;

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);

export const faqListSchema = z
  .array(z.object({ question: text(200), answer: text(1000) }))
  .max(MAX_FAQ, `Up to ${MAX_FAQ} questions.`)
  .superRefine((rows, ctx) => {
    rows.forEach((row, index) => {
      if (Boolean(row.question) !== Boolean(row.answer)) {
        const path = [index, row.question ? "answer" : "question"];
        ctx.addIssue({ code: "custom", path, message: "Fill in both, or remove this question." });
      }
    });
  })
  .transform((rows) => rows.filter((row) => row.question));

export const homeContentSchema = z.object({
  trust: z.array(text(40).min(1, "Required.")).length(TRUST_ITEMS),
  why: z.object({
    title: text(80),
    body: text(1500),
    founderName: text(80),
    founderPhoto: singleImageField("home"),
  }),
  faq: faqListSchema,
});

export type HomeContentValues = z.output<typeof homeContentSchema>;

export function readHomeContentForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  const answers = formData.getAll("faq.answer").map(String);
  return {
    trust: Array.from({ length: TRUST_ITEMS }, (_, index) => text(`trust.${index}`)),
    why: {
      title: text("why.title"),
      body: text("why.body"),
      founderName: text("why.founderName"),
      founderPhoto: text("why.founderPhoto"),
    },
    faq: formData.getAll("faq.question").map((question, index) => ({ question: String(question), answer: answers[index] ?? "" })),
  };
}
