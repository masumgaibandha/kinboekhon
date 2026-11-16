import { connectMongoose } from "@/lib/db";
import { draftPlace } from "@/lib/drafts/draft-place";
import { IncompleteOrderModel, type DraftKind, type IncompleteOrderDocument } from "@/lib/models/IncompleteOrder";
import type { PaymentOption } from "@/lib/orders/enums";

export interface AdminDraft {
  id: string;
  kind: DraftKind;
  updatedAt: Date;
  contactedAt: Date | null;
  name: string;
  phone: string;
  productName: string;
  quantity: number;
  place: string;
  address: string;
  paymentOption: PaymentOption | null;
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

  const items = docs.map((doc): AdminDraft => ({
    id: doc._id.toString(),
    kind: doc.kind === "callback" ? "callback" : "draft",
    updatedAt: doc.updatedAt,
    contactedAt: doc.contactedAt ?? null,
    name: doc.name,
    phone: doc.phone,
    productName: doc.productName,
    quantity: doc.quantity ?? 1,
    place: draftPlace(doc),
    address: doc.address,
    paymentOption: doc.paymentOption ?? null,
  }));
  return { items, total };
}
