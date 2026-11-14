import { Schema, type Types } from "mongoose";

import { appDb } from "@/lib/db";
import { PAYMENT_OPTIONS, type PaymentOption } from "@/lib/orders/enums";

export interface IncompleteOrderDocument {
  draftKey: string;
  productId: Types.ObjectId;
  productName: string;
  name: string;
  phone: string;
  address: string;
  quantity: number;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  paymentOption: PaymentOption;
  paymentMethod: string;
  contactedAt: Date | null;
  tracking: { ipHash: string; userAgent: string; sourceUrl: string };
  createdAt: Date;
  updatedAt: Date;
}

const DRAFT_DAYS = 30;

const incompleteOrderSchema = new Schema<IncompleteOrderDocument>(
  {
    draftKey: { type: String, required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, required: true },
    address: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    divisionId: { type: String, default: "" },
    districtId: { type: String, default: "" },
    upazilaId: { type: String, default: "" },
    paymentOption: { type: String, enum: PAYMENT_OPTIONS, required: true },
    paymentMethod: { type: String, default: "" },
    contactedAt: { type: Date, default: null },
    tracking: { ipHash: String, userAgent: String, sourceUrl: String },
  },
  { timestamps: true },
);

// MongoDB removes a draft 30 days after its last change; it also serves the newest-first list.
incompleteOrderSchema.index({ updatedAt: 1 }, { expireAfterSeconds: DRAFT_DAYS * 24 * 60 * 60 });
// Placing an order removes drafts with the same phone and product.
incompleteOrderSchema.index({ phone: 1, productId: 1 });

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.IncompleteOrder) appDb.deleteModel("IncompleteOrder");

export const IncompleteOrderModel = appDb.model<IncompleteOrderDocument>("IncompleteOrder", incompleteOrderSchema);
