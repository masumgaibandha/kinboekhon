import { Schema } from "mongoose";

import { ACCOUNT_TYPES } from "@/lib/account-types";
import { appDb } from "@/lib/db";
import { costsSchema } from "@/lib/models/costs-schema";
import type { AdminSettingsValues } from "@/lib/validation/settings";

type SettingsDocument = AdminSettingsValues & { key: string; launchMode?: boolean };

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

const helpPopupSchema = new Schema({ enabled: Boolean, title: String, text: String }, { _id: false });

const adsSchema = new Schema({ usdRate: Number, maxCpa: Number }, { _id: false });

const fraudSchema = new Schema(
  { minRecords: Number, checkFailPercent: Number, highMinFailed: Number, highFailPercent: Number },
  { _id: false },
);

const courierSchema = new Schema(
  {
    dhakaHalfKg: Number,
    dhakaOneKg: Number,
    dhakaTwoKg: Number,
    outsideHalfKg: Number,
    outsideOneKg: Number,
    outsideTwoKg: Number,
    returnFeePercent: Number,
    codPercent: Number,
  },
  { _id: false },
);

const settingsSchema = new Schema<SettingsDocument>(
  {
    key: { type: String, required: true, unique: true },
    deliveryChargeDhakaCity: { type: Number, min: 0 },
    deliveryChargeOutside: { type: Number, min: 0 },
    advanceDeliveryDiscount: { type: Number, min: 0 },
    fullAdvanceDiscount: { type: Number, min: 0 },
    bkash: walletSchema,
    nagad: walletSchema,
    rocket: walletSchema,
    bank: bankSchema,
    supportPhone: String,
    whatsappNumber: String,
    tradeLicense: String,
    businessAddress: String,
    trustBadges: { type: [String], default: undefined },
    // Once true, the test data reset is refused for good. Nothing in the app sets it back to false.
    launchMode: Boolean,
    duplicateWindowHours: { type: Number, min: 1 },
    hideOrderWhenOutOfStock: Boolean,
    helpPopup: helpPopupSchema,
    courier: courierSchema,
    costDefaults: costsSchema,
    ads: adsSchema,
    fraud: fraudSchema,
  },
  { timestamps: true },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Settings) appDb.deleteModel("Settings");

export const SettingsModel = appDb.model<SettingsDocument>("Settings", settingsSchema);
