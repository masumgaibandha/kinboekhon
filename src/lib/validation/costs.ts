import { z } from "zod";

const taka = z
  .string()
  .trim()
  .regex(/^\d{1,6}$/, "Enter a whole amount in taka, 0 or more.")
  .transform(Number);

// Empty means not known yet and counts as 0.
const optionalWhole = (max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{0,6}$/, message)
    .transform((value) => (value === "" ? 0 : Number(value)))
    .refine((value) => value <= max, message);

const percent = (max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d)?$/, "Enter a percent like 1 or 1.5.")
    .transform(Number)
    .refine((value) => value <= max, `Use 0 to ${max}.`);

export const costDefaultsSchema = z.object({
  shippingPerKg: taka,
  agentFee: taka,
  packaging: taka,
  courier: taka,
  codPercent: percent(20),
  returnPercent: percent(90),
  adCost: taka,
  targetProfit: taka,
});

export const productCostsSchema = costDefaultsSchema.extend({
  chinaPrice: optionalWhole(999999, "Enter a whole amount in taka."),
  weightGrams: optionalWhole(99999, "Enter whole grams, up to 99999."),
});

export type CostDefaults = z.output<typeof costDefaultsSchema>;
export type ProductCosts = z.output<typeof productCostsSchema>;
export type CostKey = keyof ProductCosts;

export const COST_DEFAULT_KEYS = Object.keys(costDefaultsSchema.shape) as (keyof CostDefaults)[];
export const PRODUCT_COST_KEYS: CostKey[] = ["chinaPrice", "weightGrams", ...COST_DEFAULT_KEYS];

// Reads the cost inputs named `<prefix>.<key>` from a form, as raw strings for Zod.
export function readCostFields(formData: FormData, prefix: string, keys: readonly CostKey[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, String(formData.get(`${prefix}.${key}`) ?? "")]));
}
