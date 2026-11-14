import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { MAX_QUANTITY } from "@/lib/orders/limits";

// Only InitiateCheckout goes through /api/track; its id is the form's draft key.
export const trackSchema = z.object({
  event: z.literal("InitiateCheckout"),
  eventId: z.string().regex(/^ic_[0-9a-f]{32}$/),
  productId: z.string().refine(isValidObjectId),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});

export type TrackInput = z.output<typeof trackSchema>;
