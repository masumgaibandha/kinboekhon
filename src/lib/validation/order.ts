import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { resolveDhakaCity, resolveLocation } from "@/lib/locations/resolve";
import type { LocationSelection } from "@/lib/locations/types";
import { DELIVERY_AREAS, MAX_QUANTITY, type DeliveryArea } from "@/lib/orders/limits";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";

const PHONE_MESSAGE = "সঠিক 11 সংখ্যার মোবাইল নম্বর দিন, যেমন 01712345678।";
const NAME_MESSAGE = "আপনার নাম লিখুন (2 থেকে 60 অক্ষর)।";
const ADDRESS_MESSAGE = "বাড়ি, রাস্তা বা এলাকার নাম লিখুন (3 থেকে 200 অক্ষর)।";
const LOCATION_MESSAGE = "এলাকার তথ্য সঠিক নয়। আবার বেছে নিন।";

const optionalId = z.string({ error: LOCATION_MESSAGE }).trim().max(20, LOCATION_MESSAGE).default("");
const LOCATION_FIELDS = new Set(["deliveryArea", "cityCorporation", "divisionId", "districtId", "upazilaId"]);

interface LocationFields extends LocationSelection {
  deliveryArea: DeliveryArea;
  cityCorporation: string;
}

// Inside Dhaka needs a city corporation; outside needs a division, district and upazila that belong together.
function resolveOrderLocation({ deliveryArea, cityCorporation, ...selection }: LocationFields) {
  return deliveryArea === "inside_dhaka" ? resolveDhakaCity(cityCorporation) : resolveLocation(selection);
}

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
  // Runs even when other fields are wrong, so the customer sees the location errors in the same round.
  .superRefine(
    (order, ctx) => {
      const result = resolveOrderLocation(order);
      if (result.ok) return;
      for (const issue of result.issues) ctx.addIssue({ code: "custom", path: [issue.field], message: issue.message });
    },
    { when: ({ issues }) => !issues.some((issue) => LOCATION_FIELDS.has(String(issue.path?.[0]))) },
  )
  .transform(({ cityCorporation, divisionId, districtId, upazilaId, ...order }, ctx) => {
    const result = resolveOrderLocation({ deliveryArea: order.deliveryArea, cityCorporation, divisionId, districtId, upazilaId });
    if (!result.ok) {
      ctx.addIssue({ code: "custom", path: ["deliveryArea"], message: LOCATION_MESSAGE });
      return z.NEVER;
    }
    return { ...order, location: result.location };
  });

export type OrderInput = z.output<typeof orderSchema>;
