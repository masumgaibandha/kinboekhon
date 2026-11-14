import { cacheLife, cacheTag } from "next/cache";

import { isAccountType } from "@/lib/account-types";
import { connectMongoose } from "@/lib/db";
import { SettingsModel } from "@/lib/models/Settings";
import type { CostDefaults } from "@/lib/validation/costs";
import type { AdminSettingsValues, Settings } from "@/lib/validation/settings";

export const SETTINGS_KEY = "main";
export const SETTINGS_TAG = "settings";

const emptyWallet = { enabled: false, number: "", accountType: "personal" } as const;

export const WALLET_KEYS = ["bkash", "nagad", "rocket"] as const;
export type WalletKey = (typeof WALLET_KEYS)[number];

// Wallets saved with an account type that is no longer offered (agent) need the admin's review.
function walletsToReview(settings: Settings): WalletKey[] {
  return WALLET_KEYS.filter((key) => !isAccountType(settings[key].accountType));
}

// Gives a wallet under review a valid placeholder type; the shop also hides it until it is fixed.
function withReviewedWallets<T extends Settings>(settings: T, keys: WalletKey[], hide: boolean): T {
  const copy = { ...settings };
  for (const key of keys) copy[key] = { ...settings[key], enabled: hide ? false : settings[key].enabled, accountType: "personal" };
  return copy;
}

export const DEFAULT_SETTINGS: Settings = {
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

export const DEFAULT_COST_DEFAULTS: CostDefaults = {
  shippingPerKg: 710,
  agentFee: 0,
  packaging: 10,
  courier: 120,
  codPercent: 1,
  returnPercent: 15,
  adCost: 250,
  targetProfit: 150,
};

function withCostDefaults(saved?: Partial<CostDefaults>): CostDefaults {
  return { ...DEFAULT_COST_DEFAULTS, ...saved };
}

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");

  await connectMongoose();
  const saved = await SettingsModel.findOne(
    { key: SETTINGS_KEY },
    { _id: 0, key: 0, __v: 0, createdAt: 0, updatedAt: 0, costDefaults: 0 },
  ).lean<Partial<Settings>>();

  const settings = { ...DEFAULT_SETTINGS, ...saved };
  return withReviewedWallets(settings, walletsToReview(settings), true);
}

export interface AdminSettings {
  settings: AdminSettingsValues;
  // The values exactly as saved, so the form's changed-field check sees a fixed account type as a change.
  saved: AdminSettingsValues;
  reviewWallets: WalletKey[];
  version: string;
}

// Uncached read for the admin form. `version` changes on every save.
export async function getSettingsForAdmin(): Promise<AdminSettings> {
  await connectMongoose();
  const doc = await SettingsModel.findOne({ key: SETTINGS_KEY }, { _id: 0, key: 0, __v: 0, createdAt: 0 }).lean<
    Partial<Settings> & { costDefaults?: Partial<CostDefaults>; updatedAt?: Date }
  >();
  const { updatedAt, ...values } = doc ?? {};
  const saved = { ...DEFAULT_SETTINGS, ...values, costDefaults: withCostDefaults(values.costDefaults) };
  const reviewWallets = walletsToReview(saved);
  return {
    settings: withReviewedWallets(saved, reviewWallets, false),
    saved,
    reviewWallets,
    version: updatedAt?.toISOString() ?? "",
  };
}

// Uncached admin read: the starting price calculator inputs for a product.
export async function getCostDefaults(): Promise<CostDefaults> {
  await connectMongoose();
  const doc = await SettingsModel.findOne({ key: SETTINGS_KEY }, { _id: 0, costDefaults: 1 }).lean<{
    costDefaults?: Partial<CostDefaults>;
  }>();
  return withCostDefaults(doc?.costDefaults);
}
