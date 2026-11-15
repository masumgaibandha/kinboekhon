import { z } from "zod";

// Taka per US dollar, up to 2 decimals.
export const usdRateSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter taka per dollar, like 125 or 122.50.")
  .transform(Number)
  .refine((rate) => rate >= 1, "Use 1 to 999.99.");

export const adSettingsSchema = z.object({
  usdRate: usdRateSchema,
  maxCpa: z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, "Enter a whole amount in taka, 0 or more.")
    .transform(Number),
});

export type AdSettings = z.output<typeof adSettingsSchema>;
