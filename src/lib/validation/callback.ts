import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";
import { PHONE_MESSAGE } from "@/lib/validation/order";

// A number sent from the help popup on a product or landing page.
export const callbackSchema = z.object({
  productId: z.string().refine(isValidObjectId),
  phone: z
    .string({ error: PHONE_MESSAGE })
    .transform(normalizePhone)
    .refine((phone) => BD_MOBILE_PATTERN.test(phone), PHONE_MESSAGE),
  turnstileToken: z.string().max(2048).default(""),
});

export type CallbackInput = z.output<typeof callbackSchema>;
