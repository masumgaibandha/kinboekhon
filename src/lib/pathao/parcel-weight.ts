import type { Types } from "mongoose";

import { ProductModel } from "@/lib/models/Product";
import { startingCosts } from "@/lib/products";
import { getCostDefaults } from "@/lib/settings";
import type { ProductCosts } from "@/lib/validation/costs";

// The product weight with packaging from the price calculator, in grams.
export async function unitWeightGrams(productId: Types.ObjectId | string): Promise<number> {
  const [product, defaults] = await Promise.all([
    ProductModel.findById(productId, { costs: 1 }).lean<{ costs?: Partial<ProductCosts> }>(),
    getCostDefaults(),
  ]);
  return startingCosts(defaults, product?.costs).weightGrams;
}
