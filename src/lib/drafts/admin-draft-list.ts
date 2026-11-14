import { connectMongoose } from "@/lib/db";
import { draftPlace } from "@/lib/drafts/draft-place";
import { IncompleteOrderModel, type IncompleteOrderDocument } from "@/lib/models/IncompleteOrder";
import type { PaymentOption } from "@/lib/orders/enums";

export interface AdminDraft {
  id: string;
  updatedAt: Date;
  contactedAt: Date | null;
  name: string;
  phone: string;
  productName: string;
  quantity: number;
  place: string;
  address: string;
  paymentOption: PaymentOption;
}

const SHOWN = 100;

// Newest first; drafts expire after 30 days, so the list stays short.
export async function listDraftsForAdmin(): Promise<{ items: AdminDraft[]; total: number }> {
  await connectMongoose();
  const [docs, total] = await Promise.all([
    IncompleteOrderModel.find({}, { draftKey: 0, tracking: 0 })
      .sort({ updatedAt: -1 })
      .limit(SHOWN)
      .lean<(IncompleteOrderDocument & { _id: { toString(): string } })[]>(),
    IncompleteOrderModel.estimatedDocumentCount(),
  ]);

  const items = docs.map((doc) => ({
    id: doc._id.toString(),
    updatedAt: doc.updatedAt,
    contactedAt: doc.contactedAt ?? null,
    name: doc.name,
    phone: doc.phone,
    productName: doc.productName,
    quantity: doc.quantity,
    place: draftPlace(doc),
    address: doc.address,
    paymentOption: doc.paymentOption,
  }));
  return { items, total };
}
