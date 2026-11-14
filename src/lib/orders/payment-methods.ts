import type { AccountType } from "@/lib/account-types";
import type { PaymentMethod, PaymentOption, PaymentStatus } from "@/lib/orders/enums";
import type { Settings } from "@/lib/validation/settings";

export const WALLET_METHODS = ["bkash", "nagad", "rocket"] as const;
export const ADVANCE_METHODS = [...WALLET_METHODS, "bank"] as const;
export type WalletMethod = (typeof WALLET_METHODS)[number];
export type AdvanceMethod = (typeof ADVANCE_METHODS)[number];

export type PaymentAccount =
  | { method: WalletMethod; number: string; accountType: AccountType }
  | { method: "bank"; bankName: string; accountName: string; accountNumber: string; branch: string; routingNumber: string };

export const METHOD_LABELS_BN: Record<AdvanceMethod, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  bank: "ব্যাংক",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank transfer",
};

export const OPTION_LABELS: Record<PaymentOption, string> = {
  cod: "Cash on delivery",
  advance_full: "Full amount in advance",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  cod: "Cash on delivery",
  submitted: "Waiting for review",
  verified: "Verified",
  rejected: "Rejected",
};

export const ACCOUNT_TYPE_LABELS_BN: Record<AccountType, string> = {
  personal: "পার্সোনাল",
  merchant: "মার্চেন্ট",
};

// How the customer sends to each wallet account type.
export const SEND_HOW_BN: Record<AccountType, string> = {
  personal: "সেন্ড মানি",
  merchant: "পেমেন্ট",
};

export function isAdvanceMethod(value: string): value is AdvanceMethod {
  return (ADVANCE_METHODS as readonly string[]).includes(value);
}

// The accounts the shop shows, only those enabled in Settings, in a fixed order.
export function enabledAccounts(settings: Settings): PaymentAccount[] {
  const wallets = WALLET_METHODS.filter((method) => settings[method].enabled && settings[method].number).map(
    (method): PaymentAccount => ({ method, number: settings[method].number, accountType: settings[method].accountType }),
  );
  const { enabled, ...bank } = settings.bank;
  return enabled && bank.accountNumber ? [...wallets, { method: "bank", ...bank }] : wallets;
}
