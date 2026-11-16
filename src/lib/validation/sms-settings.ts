import { z } from "zod";

import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";
import { AUTO_TEMPLATES, type AutoTemplate, unknownPlaceholders } from "@/lib/sms/templates";

export const SMS_MAX_CHARS = 480;

const templateSchema = z
  .object({
    enabled: z.boolean(),
    text: z.string().trim().max(SMS_MAX_CHARS, `Use at most ${SMS_MAX_CHARS} characters.`),
  })
  .superRefine((template, ctx) => {
    if (template.enabled && template.text.length < 2) {
      ctx.addIssue({ code: "custom", path: ["text"], message: "Write the SMS text, or turn this SMS off." });
    }
    const unknown = unknownPlaceholders(template.text);
    if (unknown.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["text"],
        message: `Unknown placeholder {${unknown[0]}}. Use {name}, {order}, {amount} or {track}.`,
      });
    }
  });

export const smsSettingsSchema = z.object({
  // Taka per SMS part, up to 2 decimals, for the estimated cost.
  pricePerPart: z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d{1,2})?$/, "Enter taka per SMS part, like 0.35.")
    .transform(Number),
  templates: z.object(
    Object.fromEntries(AUTO_TEMPLATES.map((key) => [key, templateSchema])) as Record<AutoTemplate, typeof templateSchema>,
  ),
});

export type SmsSettings = z.output<typeof smsSettingsSchema>;

export const manualSmsSchema = z.object({
  orderNumber: z.string().regex(/^KE\d+$/),
  text: z
    .string()
    .trim()
    .min(2, "Write the SMS text.")
    .max(SMS_MAX_CHARS, `Use at most ${SMS_MAX_CHARS} characters.`),
});

export const testSmsSchema = z.object({
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((phone) => BD_MOBILE_PATTERN.test(phone), "Enter an 11 digit mobile number, like 01712345678."),
});
