import type { Types } from "mongoose";

import { ProductModel } from "@/lib/models/Product";
import { startingCosts } from "@/lib/products";
import { getCostDefaults } from "@/lib/settings";
import type { ProductCosts } from "@/lib/validation/costs";

// Every line's product weight with packaging from the price calculator x its quantity, in grams.
export async function parcelGrams(items: { productId: Types.ObjectId | string; quantity: number }[]): Promise<number> {
  const [products, defaults] = await Promise.all([
    ProductModel.find({ _id: { $in: items.map((item) => item.productId) } }, { costs: 1 }).lean<
      { _id: Types.ObjectId; costs?: Partial<ProductCosts> }[]
    >(),
    getCostDefaults(),
  ]);
  const costs = new Map(products.map((product) => [String(product._id), product.costs]));
  return items.reduce((sum, item) => sum + startingCosts(defaults, costs.get(String(item.productId))).weightGrams * item.quantity, 0);
}
