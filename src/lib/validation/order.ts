import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { DELIVERY_AREAS, MAX_QUANTITY } from "@/lib/orders/limits";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";

const PHONE_MESSAGE = "সঠিক 11 সংখ্যার মোবাইল নম্বর দিন, যেমন 01712345678।";
const NAME_MESSAGE = "আপনার নাম লিখুন (2 থেকে 60 অক্ষর)।";
const ADDRESS_MESSAGE = "পূর্ণ ঠিকানা লিখুন (কমপক্ষে 6 অক্ষর)।";

// Unknown keys such as a price sent by the browser are dropped; prices always come from the database.
export const orderSchema = z.object({
  productId: z.string({ error: "পণ্যটি খুঁজে পাওয়া যায়নি।" }).refine(isValidObjectId, "পণ্যটি খুঁজে পাওয়া যায়নি।"),
  quantity: z
    .number({ error: "পরিমাণ সঠিক নয়।" })
    .int("পরিমাণ সঠিক নয়।")
    .min(1, "পরিমাণ সঠিক নয়।")
    .max(MAX_QUANTITY, "একবারে সর্বোচ্চ 5টি অর্ডার করা যায়।"),
  deliveryArea: z.enum(DELIVERY_AREAS, { error: "ডেলিভারি এলাকা বেছে নিন।" }),
  name: z.string({ error: NAME_MESSAGE }).trim().min(2, NAME_MESSAGE).max(60, NAME_MESSAGE),
  phone: z
    .string({ error: PHONE_MESSAGE })
    .transform(normalizePhone)
    .refine((phone) => BD_MOBILE_PATTERN.test(phone), PHONE_MESSAGE),
  address: z
    .string({ error: ADDRESS_MESSAGE })
    .trim()
    .min(6, ADDRESS_MESSAGE)
    .max(300, "ঠিকানা 300 অক্ষরের মধ্যে লিখুন।"),
});

export type OrderInput = z.output<typeof orderSchema>;
