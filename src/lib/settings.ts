import { cacheLife, cacheTag } from "next/cache";

import { connectMongoose } from "@/lib/db";
import { SettingsModel } from "@/lib/models/Settings";
import type { Settings } from "@/lib/validation/settings";

export const SETTINGS_KEY = "main";
export const SETTINGS_TAG = "settings";

const emptyWallet = { enabled: false, number: "", accountType: "personal" } as const;

export const DEFAULT_SETTINGS: Settings = {
  deliveryChargeInsideDhaka: 80,
  deliveryChargeOutsideDhaka: 150,
  advanceDeliveryDiscount: 20,
  fullAdvanceDiscount: 50,
  bkash: emptyWallet,
  nagad: emptyWallet,
  rocket: emptyWallet,
  bank: {
    enabled: false,
    bankName: "",
    accountName: "",
    accountNumber: "",
    branch: "",
    routingNumber: "",
  },
  supportPhone: "",
  whatsappNumber: "",
  duplicateWindowHours: 24,
};

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");

  await connectMongoose();
  const saved = await SettingsModel.findOne(
    { key: SETTINGS_KEY },
    { _id: 0, key: 0, __v: 0, createdAt: 0, updatedAt: 0 },
  ).lean<Partial<Settings>>();

  return { ...DEFAULT_SETTINGS, ...saved };
}
