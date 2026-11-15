import { Schema } from "mongoose";

import { CUSTOMER_TAGS, type CustomerTag } from "@/lib/customers/tags";
import { appDb } from "@/lib/db";

export interface CustomerNote {
  text: string;
  at: Date;
}

export interface CustomerDocument {
  phone: string;
  // Name and district come from the customer's newest order.
  name: string;
  district: string;
  lastOrderAt: Date;
  tags: CustomerTag[];
  notes: CustomerNote[];
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<CustomerDocument>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    district: { type: String, default: "" },
    lastOrderAt: { type: Date, required: true },
    tags: { type: [{ type: String, enum: CUSTOMER_TAGS }], default: [] },
    notes: { type: [{ _id: false, text: { type: String, required: true }, at: { type: Date, required: true } }], default: [] },
  },
  { timestamps: true },
);

customerSchema.index({ lastOrderAt: -1 });
customerSchema.index({ tags: 1, lastOrderAt: -1 });

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Customer) appDb.deleteModel("Customer");

export const CustomerModel = appDb.model<CustomerDocument>("Customer", customerSchema);
