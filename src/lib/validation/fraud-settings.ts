import { z } from "zod";

function whole(max: number, message: string) {
  return z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, message)
    .transform(Number)
    .refine((value) => value <= max, message);
}

const PERCENT = "Enter a whole percent, 0 to 100.";

export const fraudSettingsSchema = z.object({
  minRecords: whole(1000, "Enter a whole number, 0 to 1,000."),
  checkFailPercent: whole(100, PERCENT),
  highMinFailed: whole(1000, "Enter a whole number, 0 to 1,000."),
  highFailPercent: whole(100, PERCENT),
});

export const FRAUD_SETTING_KEYS = ["minRecords", "checkFailPercent", "highMinFailed", "highFailPercent"] as const;
