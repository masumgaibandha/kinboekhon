import { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import type { DraftRequestInfo } from "@/lib/drafts/save-draft";
import { IncompleteOrderModel } from "@/lib/models/IncompleteOrder";
import { ProductModel } from "@/lib/models/Product";

// Saves a callback request in the incomplete orders list; false when the product is not active.
export async function saveCallback(productId: string, phone: string, request: DraftRequestInfo): Promise<boolean> {
  await connectMongoose();
  const id = new Types.ObjectId(productId);
  const product = await ProductModel.findOne({ _id: id, active: true }, { name: 1 }).lean<{ name: string }>();
  if (!product) return false;

  // One request per phone and product: asking again moves it to the top and clears "contacted".
  await IncompleteOrderModel.updateOne(
    { draftKey: `callback:${productId}:${phone}` },
    { $set: { kind: "callback", productId: id, productName: product.name, phone, contactedAt: null, tracking: request } },
    { upsert: true },
  );
  return true;
}
