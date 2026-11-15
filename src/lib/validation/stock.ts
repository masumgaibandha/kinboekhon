import { isValidObjectId } from "mongoose";
import { z } from "zod";

const productId = z.string().refine(isValidObjectId, "Product not found.");

const units = (message: string) => z.string().trim().regex(/^\d{1,6}$/, message).transform(Number);

export const stockPurchaseSchema = z.object({
  productId,
  quantity: units("Enter whole units, 1 or more.").refine((value) => value >= 1, "Enter whole units, 1 or more."),
  unitCost: units("Enter the cost per unit in whole taka."),
  note: z.string().trim().max(200, "Use up to 200 characters."),
});

export const stockAdjustmentSchema = z.object({
  productId,
  change: z
    .string()
    .trim()
    .regex(/^[+-]?\d{1,6}$/, "Enter whole units, like -2 or 3.")
    .transform(Number)
    .refine((value) => value !== 0, "Enter a change other than 0."),
  reason: z.string().trim().min(3, "Write the reason.").max(200, "Use up to 200 characters."),
});

const level = units("Enter whole units, 0 or more.");

export const lowStockLevelSchema = z.object({ productId, level, initial: level });

export type StockPurchase = z.output<typeof stockPurchaseSchema>;
export type StockAdjustment = z.output<typeof stockAdjustmentSchema>;
