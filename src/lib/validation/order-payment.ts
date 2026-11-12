import { z } from "zod";

import { PAYMENT_OPTIONS, type PaymentOption } from "@/lib/orders/enums";
import { isAdvanceMethod, type AdvanceMethod } from "@/lib/orders/payment-methods";
import { TRANSACTION_ID_PATTERN, normalizeTransactionId } from "@/lib/orders/transaction-id";
import { BD_MOBILE_PATTERN, ROCKET_PATTERN, normalizePhone } from "@/lib/phone";

const MESSAGES = {
  option: "পেমেন্টের ধরন বেছে নিন।",
  method: "কোন মাধ্যমে টাকা পাঠিয়েছেন বেছে নিন।",
  wallet: "যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি লিখুন, যেমন 01712345678।",
  bank: "যে অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন তার নম্বর লিখুন (6 থেকে 20 সংখ্যা)।",
  transactionId: "সঠিক Transaction ID লিখুন (6 থেকে 30 অক্ষর: ইংরেজি অক্ষর, সংখ্যা বা -)।",
};

const BANK_ACCOUNT_PATTERN = /^\d{6,20}$/;
const PAYMENT_FIELDS = new Set(["paymentOption", "paymentMethod", "senderNumber", "transactionId"]);

export const paymentShape = {
  paymentOption: z.enum(PAYMENT_OPTIONS, { error: MESSAGES.option }).default("cod"),
  paymentMethod: z.string({ error: MESSAGES.method }).trim().max(20, MESSAGES.method).default(""),
  senderNumber: z.string({ error: MESSAGES.wallet }).trim().max(40, MESSAGES.wallet).default(""),
  transactionId: z.string({ error: MESSAGES.transactionId }).trim().max(60, MESSAGES.transactionId).default(""),
};

interface PaymentFields {
  paymentOption: PaymentOption;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
}

export type PaymentInput =
  | { option: "cod" }
  | {
      option: Exclude<PaymentOption, "cod">;
      method: AdvanceMethod;
      senderNumber: string;
      transactionId: string;
      transactionIdNormalized: string;
    };

type PaymentCheck = { ok: true; payment: PaymentInput } | { ok: false; issues: { field: string; message: string }[] };

// Advance orders need an advance method, the sender's number or account, and a Transaction ID.
export function checkPayment(fields: PaymentFields): PaymentCheck {
  const { paymentOption: option, paymentMethod: method } = fields;
  if (option === "cod") return { ok: true, payment: { option } };
  if (!isAdvanceMethod(method)) return { ok: false, issues: [{ field: "paymentMethod", message: MESSAGES.method }] };

  const issues: { field: string; message: string }[] = [];
  const sender = method === "bank" ? fields.senderNumber.replace(/[\s-]/g, "") : normalizePhone(fields.senderNumber);
  const senderPattern = method === "bank" ? BANK_ACCOUNT_PATTERN : method === "rocket" ? ROCKET_PATTERN : BD_MOBILE_PATTERN;
  if (!senderPattern.test(sender)) issues.push({ field: "senderNumber", message: method === "bank" ? MESSAGES.bank : MESSAGES.wallet });

  const transactionIdNormalized = normalizeTransactionId(fields.transactionId);
  if (!TRANSACTION_ID_PATTERN.test(transactionIdNormalized)) issues.push({ field: "transactionId", message: MESSAGES.transactionId });

  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    payment: { option, method, senderNumber: sender, transactionId: fields.transactionId, transactionIdNormalized },
  };
}

export function addPaymentIssues(fields: PaymentFields, ctx: z.RefinementCtx) {
  const result = checkPayment(fields);
  if (result.ok) return;
  for (const issue of result.issues) ctx.addIssue({ code: "custom", path: [issue.field], message: issue.message });
}

// Runs the payment check even when other fields are wrong, so every error shows in the same round.
export const PAYMENT_CHECK = {
  when: ({ issues }: { issues: { path?: PropertyKey[] }[] }) =>
    !issues.some((issue) => PAYMENT_FIELDS.has(String(issue.path?.[0]))),
};
