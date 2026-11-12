import { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { IncompleteOrderModel } from "@/lib/models/IncompleteOrder";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { getSettings } from "@/lib/settings";
import type { DraftInput } from "@/lib/validation/draft";

const HOUR = 60 * 60 * 1000;

export interface DraftRequestInfo {
  ipHash: string;
  userAgent: string;
  sourceUrl: string;
}

// Creates or updates the draft; skipped when the product is gone or this phone already ordered it.
export async function saveDraft(input: DraftInput, request: DraftRequestInfo): Promise<void> {
  await connectMongoose();
  const productId = new Types.ObjectId(input.productId);
  const product = await ProductModel.findOne({ _id: productId, active: true }, { name: 1 }).lean<{ name: string }>();
  if (!product) return;

  // A blur on the last field can arrive after the order itself; that draft must not come back.
  const { duplicateWindowHours } = await getSettings();
  const since = new Date(Date.now() - duplicateWindowHours * HOUR);
  if (await OrderModel.exists({ "customer.phone": input.phone, "product.productId": productId, createdAt: { $gte: since } })) return;

  const { draftKey, ...fields } = input;
  await IncompleteOrderModel.updateOne(
    { draftKey },
    { $set: { ...fields, productId, productName: product.name, tracking: request } },
    { upsert: true },
  );
}

// Placing an order removes its draft and any other draft for the same phone and product.
export async function deleteDraftsForOrder(draftKey: string | undefined, phone: string, productId: Types.ObjectId) {
  const match = draftKey ? [{ draftKey }, { phone, productId }] : [{ phone, productId }];
  await IncompleteOrderModel.deleteMany({ $or: match });
}
