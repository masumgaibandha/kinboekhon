import { Schema } from "mongoose";

import { CUSTOMER_TAGS, type CustomerTag } from "@/lib/customers/tags";
import { registerModel } from "@/lib/db";
import { RISK_LABELS, type RiskLabel } from "@/lib/fraud/risk";

export interface CustomerNote {
  text: string;
  at: Date;
}

// Courier delivery history summed over every source, with its label from the Settings thresholds.
export interface CustomerRisk {
  label: RiskLabel;
  delivered: number;
  failed: number;
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
  // Set once the phone has a delivery history check or a manual entry.
  risk?: CustomerRisk;
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
    risk: {
      type: new Schema(
        { label: { type: String, enum: RISK_LABELS }, delivered: Number, failed: Number, at: Date },
        { _id: false },
      ),
      default: undefined,
    },
  },
  { timestamps: true },
);

customerSchema.index({ lastOrderAt: -1 });
customerSchema.index({ tags: 1, lastOrderAt: -1 });
// Phones by risk label, for the orders list filter.
customerSchema.index({ "risk.label": 1 });

export const CustomerModel = registerModel<CustomerDocument>("Customer", customerSchema);
