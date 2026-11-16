import { isValidObjectId } from "mongoose";
import { z } from "zod";

// "" clears the campaign's product.
export const campaignProductSchema = z.object({
  campaignId: z.string().regex(/^\d{1,30}$/, "Unknown campaign."),
  productId: z.string().refine((value) => value === "" || isValidObjectId(value), "Choose a product."),
});
