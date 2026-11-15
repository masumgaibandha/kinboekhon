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
  bookingMoney: whole(999999, "Enter a whole amount in taka, 0 or more."),
});

export const FRAUD_SETTING_KEYS = ["minRecords", "checkFailPercent", "highMinFailed", "highFailPercent", "bookingMoney"] as const;
