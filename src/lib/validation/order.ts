import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { DELIVERY_AREAS, MAX_QUANTITY } from "@/lib/orders/limits";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";
import { LOCATION_CHECK, addLocationIssues, resolveAreaLocation } from "@/lib/validation/location-fields";

const PHONE_MESSAGE = "সঠিক 11 সংখ্যার মোবাইল নম্বর দিন, যেমন 01712345678।";
const NAME_MESSAGE = "আপনার নাম লিখুন (2 থেকে 60 অক্ষর)।";
const ADDRESS_MESSAGE = "বাড়ি, রাস্তা বা এলাকার নাম লিখুন (3 থেকে 200 অক্ষর)।";
const LOCATION_MESSAGE = "এলাকার তথ্য সঠিক নয়। আবার বেছে নিন।";

const optionalId = z.string({ error: LOCATION_MESSAGE }).trim().max(20, LOCATION_MESSAGE).default("");

// Unknown keys such as a price sent by the browser are dropped; prices always come from the database.
export const orderSchema = z
  .object({
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
    cityCorporation: optionalId,
    divisionId: optionalId,
    districtId: optionalId,
    upazilaId: optionalId,
    address: z.string({ error: ADDRESS_MESSAGE }).trim().min(3, ADDRESS_MESSAGE).max(200, ADDRESS_MESSAGE),
  })
  .superRefine((order, ctx) => addLocationIssues(order, ctx), LOCATION_CHECK)
  .transform(({ cityCorporation, divisionId, districtId, upazilaId, ...order }, ctx) => {
    const result = resolveAreaLocation({ deliveryArea: order.deliveryArea, cityCorporation, divisionId, districtId, upazilaId });
    if (!result.ok) {
      ctx.addIssue({ code: "custom", path: ["deliveryArea"], message: LOCATION_MESSAGE });
      return z.NEVER;
    }
    return { ...order, location: result.location };
  });

export type OrderInput = z.output<typeof orderSchema>;
