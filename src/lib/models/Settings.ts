import { Schema } from "mongoose";

import { ACCOUNT_TYPES } from "@/lib/account-types";
import { appDb } from "@/lib/db";
import type { Settings } from "@/lib/validation/settings";

type SettingsDocument = Settings & { key: string };

const walletSchema = new Schema(
  {
    enabled: Boolean,
    number: String,
    accountType: { type: String, enum: ACCOUNT_TYPES },
  },
  { _id: false },
);

const bankSchema = new Schema(
  {
    enabled: Boolean,
    bankName: String,
    accountName: String,
    accountNumber: String,
    branch: String,
    routingNumber: String,
  },
  { _id: false },
);

const settingsSchema = new Schema<SettingsDocument>(
  {
    key: { type: String, required: true, unique: true },
    deliveryChargeInsideDhaka: { type: Number, min: 0 },
    deliveryChargeOutsideDhaka: { type: Number, min: 0 },
    advanceDeliveryDiscount: { type: Number, min: 0 },
    fullAdvanceDiscount: { type: Number, min: 0 },
    bkash: walletSchema,
    nagad: walletSchema,
    rocket: walletSchema,
    bank: bankSchema,
    supportPhone: String,
    whatsappNumber: String,
    duplicateWindowHours: { type: Number, min: 1 },
  },
  { timestamps: true },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Settings) appDb.deleteModel("Settings");

export const SettingsModel = appDb.model<SettingsDocument>("Settings", settingsSchema);
