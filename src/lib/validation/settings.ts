import { z } from "zod";

import { ACCOUNT_TYPES } from "@/lib/account-types";
import { BD_MOBILE_PATTERN, ROCKET_PATTERN, normalizePhone } from "@/lib/phone";

const amount = z
  .string()
  .trim()
  .regex(/^\d{1,6}$/, "Enter a whole amount in taka, 0 or more.")
  .transform(Number);

function phone(pattern: RegExp, message: string) {
  return z
    .string()
    .transform(normalizePhone)
    .refine((value) => value === "" || pattern.test(value), message);
}

function walletSchema(pattern: RegExp, message: string) {
  return z
    .object({
      enabled: z.boolean(),
      number: phone(pattern, message),
      accountType: z.enum(ACCOUNT_TYPES, { error: "Choose Personal or Merchant." }),
    })
    .refine((wallet) => !wallet.enabled || wallet.number !== "", {
      path: ["number"],
      message: "Number is required when this account is enabled.",
    });
}

const BANK_REQUIRED = ["bankName", "accountName", "accountNumber"] as const;

const bankSchema = z
  .object({
    enabled: z.boolean(),
    bankName: z.string().trim().max(100),
    accountName: z.string().trim().max(100),
    accountNumber: z.string().trim().regex(/^(\d{6,20})?$/, "Use 6 to 20 digits."),
    branch: z.string().trim().max(100),
    routingNumber: z.string().trim().regex(/^(\d{9})?$/, "Routing number has 9 digits."),
  })
  .superRefine((bank, ctx) => {
    if (!bank.enabled) return;
    for (const field of BANK_REQUIRED) {
      if (!bank[field]) {
        ctx.addIssue({ code: "custom", path: [field], message: "Required when bank transfer is enabled." });
      }
    }
  });

const MOBILE_MESSAGE = "Enter a valid 11 digit mobile number.";
const DISCOUNTS = ["advanceDeliveryDiscount", "fullAdvanceDiscount"] as const;

export const settingsSchema = z
  .object({
    deliveryChargeInsideDhaka: amount,
    deliveryChargeOutsideDhaka: amount,
    advanceDeliveryDiscount: amount,
    fullAdvanceDiscount: amount,
    bkash: walletSchema(BD_MOBILE_PATTERN, MOBILE_MESSAGE),
    nagad: walletSchema(BD_MOBILE_PATTERN, MOBILE_MESSAGE),
    rocket: walletSchema(ROCKET_PATTERN, "Enter a valid 11 or 12 digit Rocket number."),
    bank: bankSchema,
    supportPhone: phone(BD_MOBILE_PATTERN, MOBILE_MESSAGE),
    whatsappNumber: phone(BD_MOBILE_PATTERN, MOBILE_MESSAGE),
    duplicateWindowHours: z
      .string()
      .trim()
      .regex(/^\d{1,3}$/, "Enter whole hours.")
      .transform(Number)
      .refine((hours) => hours >= 1 && hours <= 168, "Use 1 to 168 hours."),
  })
  .superRefine((settings, ctx) => {
    const { deliveryChargeInsideDhaka: inside, deliveryChargeOutsideDhaka: outside } = settings;
    const amounts = [inside, outside, ...DISCOUNTS.map((field) => settings[field])];
    if (!amounts.every(Number.isInteger)) return;

    const maxDiscount = Math.min(inside, outside);
    for (const field of DISCOUNTS) {
      if (settings[field] > maxDiscount) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `Can't be more than the lowest delivery charge (${maxDiscount} taka).`,
        });
      }
    }
  });

export type Settings = z.output<typeof settingsSchema>;
export type WalletSettings = Settings["bkash"];
