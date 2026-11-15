import { z } from "zod";

import { percentField } from "@/lib/validation/costs";

const rate = z
  .string()
  .trim()
  .regex(/^\d{1,5}$/, "Enter a whole amount in taka, 0 or more.")
  .transform(Number);

export const courierSettingsSchema = z.object({
  dhakaHalfKg: rate,
  dhakaOneKg: rate,
  dhakaTwoKg: rate,
  outsideHalfKg: rate,
  outsideOneKg: rate,
  outsideTwoKg: rate,
  returnFeePercent: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Enter a whole percent, 0 to 100.")
    .transform(Number)
    .refine((value) => value <= 100, "Enter a whole percent, 0 to 100."),
  codPercent: percentField(20),
});

export type CourierSettings = z.output<typeof courierSettingsSchema>;

export const COURIER_SETTING_KEYS = Object.keys(courierSettingsSchema.shape) as (keyof CourierSettings)[];
