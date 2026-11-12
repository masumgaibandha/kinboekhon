import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { PAYMENT_OPTIONS } from "@/lib/orders/enums";
import { DELIVERY_AREAS, MAX_QUANTITY } from "@/lib/orders/limits";
import { ADVANCE_METHODS } from "@/lib/orders/payment-methods";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";

// 16 random bytes as hex, made in the browser and kept in localStorage per product.
export const DRAFT_KEY_PATTERN = /^[0-9a-f]{32}$/;

const id = z.string().trim().max(20).default("");

// What the order form has so far; only the phone must be complete. The browser never sees these messages.
export const draftSchema = z.object({
  draftKey: z.string().regex(DRAFT_KEY_PATTERN),
  productId: z.string().refine(isValidObjectId),
  name: z.string().trim().max(60).default(""),
  phone: z.string().transform(normalizePhone).refine((phone) => BD_MOBILE_PATTERN.test(phone)),
  address: z.string().trim().max(200).default(""),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  deliveryArea: z.enum(DELIVERY_AREAS),
  cityCorporation: id,
  divisionId: id,
  districtId: id,
  upazilaId: id,
  paymentOption: z.enum(PAYMENT_OPTIONS),
  paymentMethod: z.union([z.enum(ADVANCE_METHODS), z.literal("")]).default(""),
});

export type DraftInput = z.output<typeof draftSchema>;

export const draftIdSchema = z.object({ id: z.string().refine(isValidObjectId, "Draft not found.") });
