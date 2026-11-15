import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { dhakaDay, dhakaDayStart } from "@/lib/dates";
import { usdRateSchema } from "@/lib/validation/ad-settings";

export const adSpendSchema = z.object({
  day: z
    .string()
    .refine((day) => dhakaDayStart(day) !== null, "Choose a date.")
    .refine((day) => day <= dhakaDay(new Date()), "The date cannot be after today."),
  productId: z.string().refine(isValidObjectId, "Choose a product."),
  amountUsd: z
    .string()
    .trim()
    .regex(/^\d{1,5}(\.\d{1,2})?$/, "Enter the amount in USD, like 12.50.")
    .transform(Number)
    .refine((amount) => amount > 0, "Enter more than 0."),
  usdRate: usdRateSchema,
});

export type AdSpendInput = z.output<typeof adSpendSchema>;

export const adSpendIdSchema = z.object({ id: z.string().refine(isValidObjectId) });

export function readAdSpendForm(formData: FormData): Record<keyof AdSpendInput, string> {
  const text = (name: string) => String(formData.get(name) ?? "");
  return { day: text("day"), productId: text("productId"), amountUsd: text("amountUsd"), usdRate: text("usdRate") };
}
