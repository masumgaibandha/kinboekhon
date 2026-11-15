import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { resolveLocation } from "@/lib/locations/resolve";
import { MAX_EXTRAS, MAX_QUANTITY } from "@/lib/orders/limits";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";
import { DRAFT_KEY_PATTERN } from "@/lib/validation/draft";
import { LOCATION_CHECK, addLocationIssues } from "@/lib/validation/location-fields";
import { PAYMENT_CHECK, addPaymentIssues, checkPayment, paymentShape } from "@/lib/validation/order-payment";

const PHONE_MESSAGE = "সঠিক 11 সংখ্যার মোবাইল নম্বর দিন, যেমন 01712345678।";
const NAME_MESSAGE = "আপনার নাম লিখুন (2 থেকে 60 অক্ষর)।";
const ADDRESS_MESSAGE = "বাড়ি, রাস্তা বা এলাকার নাম লিখুন (3 থেকে 200 অক্ষর)।";
const LOCATION_MESSAGE = "এলাকার তথ্য সঠিক নয়। আবার বেছে নিন।";

const PRODUCT_MESSAGE = "পণ্যটি খুঁজে পাওয়া যায়নি।";
const productId = z.string({ error: PRODUCT_MESSAGE }).refine(isValidObjectId, PRODUCT_MESSAGE);
const quantity = z
  .number({ error: "পরিমাণ সঠিক নয়।" })
  .int("পরিমাণ সঠিক নয়।")
  .min(1, "পরিমাণ সঠিক নয়।")
  .max(MAX_QUANTITY, "একবারে সর্বোচ্চ 5টি অর্ডার করা যায়।");
const EXTRAS_MESSAGE = "সঙ্গে নেওয়া পণ্যগুলো আবার বেছে নিন।";

const optionalId = z.string({ error: LOCATION_MESSAGE }).trim().max(20, LOCATION_MESSAGE).default("");

// Unknown keys such as a price sent by the browser are dropped; prices always come from the database.
export const orderSchema = z
  .object({
    productId,
    quantity,
    // Products added from "এটাও নিন", each once and never the main product.
    extras: z
      .array(z.object({ productId, quantity }), { error: EXTRAS_MESSAGE })
      .max(MAX_EXTRAS, EXTRAS_MESSAGE)
      .default([]),
    name: z.string({ error: NAME_MESSAGE }).trim().min(2, NAME_MESSAGE).max(60, NAME_MESSAGE),
    phone: z
      .string({ error: PHONE_MESSAGE })
      .transform(normalizePhone)
      .refine((phone) => BD_MOBILE_PATTERN.test(phone), PHONE_MESSAGE),
    divisionId: optionalId,
    districtId: optionalId,
    upazilaId: optionalId,
    address: z.string({ error: ADDRESS_MESSAGE }).trim().min(3, ADDRESS_MESSAGE).max(200, ADDRESS_MESSAGE),
    ...paymentShape,
    // Links the order to its draft; a wrong key never stops the order.
    draftKey: z.string().regex(DRAFT_KEY_PATTERN).optional().catch(undefined),
  })
  .superRefine((order, ctx) => {
    const ids = [order.productId, ...order.extras.map((extra) => extra.productId)];
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", path: ["extras"], message: EXTRAS_MESSAGE });
  })
  .superRefine((order, ctx) => addLocationIssues(order, ctx), LOCATION_CHECK)
  .superRefine((order, ctx) => addPaymentIssues(order, ctx), PAYMENT_CHECK)
  .transform((fields, ctx) => {
    const { divisionId, districtId, upazilaId, paymentOption, paymentMethod, senderNumber, transactionId, ...order } = fields;
    const location = resolveLocation({ divisionId, districtId, upazilaId });
    const payment = checkPayment({ paymentOption, paymentMethod, senderNumber, transactionId });
    if (!location.ok || !payment.ok) {
      ctx.addIssue({ code: "custom", path: ["location"], message: LOCATION_MESSAGE });
      return z.NEVER;
    }
    return { ...order, location: location.location, payment: payment.payment };
  });

export type OrderInput = z.output<typeof orderSchema>;
