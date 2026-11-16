import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";
import { SMS_TEMPLATE_KINDS, type SmsTemplateKind } from "@/lib/sms/templates";

export const SMS_STATUSES = ["sending", "sent", "failed", "not_connected", "skipped"] as const;
export type SmsStatus = (typeof SMS_STATUSES)[number];

export interface SmsLogDocument {
  orderNumber: string;
  phone: string;
  template: SmsTemplateKind;
  text: string;
  parts: number;
  status: SmsStatus;
  provider: string;
  reply: string;
  // "<orderNumber>:<template>" for automatic SMS, so each one goes out once per order.
  onceKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const smsLogSchema = new Schema<SmsLogDocument>(
  {
    orderNumber: { type: String, required: true },
    phone: { type: String, required: true },
    template: { type: String, enum: SMS_TEMPLATE_KINDS, required: true },
    text: { type: String, required: true },
    parts: { type: Number, required: true },
    status: { type: String, enum: SMS_STATUSES, required: true },
    provider: { type: String, default: "" },
    reply: { type: String, default: "" },
    onceKey: String,
  },
  { timestamps: true, versionKey: false },
);

smsLogSchema.index({ onceKey: 1 }, { unique: true, partialFilterExpression: { onceKey: { $type: "string" } } });
smsLogSchema.index({ phone: 1, createdAt: -1 });
smsLogSchema.index({ orderNumber: 1, createdAt: -1 });
smsLogSchema.index({ createdAt: -1 });

export const SmsLogModel = registerModel<SmsLogDocument>("SmsLog", smsLogSchema);
