import { z } from "zod";

import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";

const ORDER_NUMBER_MESSAGE = "সঠিক অর্ডার নম্বর লিখুন, যেমন KE10001।";
const PHONE_MESSAGE = "অর্ডারের সময় দেওয়া 11 সংখ্যার মোবাইল নম্বর লিখুন।";

// "KE10001", "ke 10001" or "10001", Bangla digits too.
const ORDER_NUMBER_PATTERN = /^(?:KE)?([1-9]\d{4,8})$/;

export const orderStatusSchema = z.object({
  orderNumber: z
    .string({ error: ORDER_NUMBER_MESSAGE })
    .transform((raw) => normalizePhone(raw).toUpperCase())
    .refine((value) => ORDER_NUMBER_PATTERN.test(value), ORDER_NUMBER_MESSAGE)
    .transform((value) => `KE${ORDER_NUMBER_PATTERN.exec(value)?.[1]}`),
  phone: z
    .string({ error: PHONE_MESSAGE })
    .transform(normalizePhone)
    .refine((phone) => BD_MOBILE_PATTERN.test(phone), PHONE_MESSAGE),
});

export type OrderStatusInput = z.output<typeof orderStatusSchema>;
