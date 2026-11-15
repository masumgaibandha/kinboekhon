import { z } from "zod";

import { ORDER_NUMBER_PATTERN } from "@/lib/orders/admin-order-detail";
import { RETURN_REASONS } from "@/lib/orders/enums";

const orderNumber = z.string().regex(ORDER_NUMBER_PATTERN, "Order not found.");
const COUNT_MESSAGE = "Enter a whole number, 0 to 9,999.";

const count = z
  .string()
  .trim()
  .regex(/^(\d{1,4})?$/, COUNT_MESSAGE)
  .transform((value) => (value === "" ? null : Number(value)));

export const deliveryCheckSchema = z.object({ orderNumber });

// Counts or a Pathao rating (or both); both counts go together.
export const manualHistorySchema = z
  .object({
    orderNumber,
    delivered: count,
    failed: count,
    pathaoRating: z.string().trim().max(40, "Keep the rating under 40 characters."),
    note: z.string().trim().max(300, "Keep the note under 300 characters."),
  })
  .superRefine((entry, ctx) => {
    if ((entry.delivered === null) !== (entry.failed === null)) {
      const path = entry.delivered === null ? "delivered" : "failed";
      ctx.addIssue({ code: "custom", path: [path], message: "Enter both counts, or neither." });
    } else if (entry.delivered === null && entry.pathaoRating === "") {
      ctx.addIssue({ code: "custom", path: ["delivered"], message: "Enter the counts or a Pathao rating." });
    }
  });

export type ManualHistory = z.output<typeof manualHistorySchema>;

export const returnReasonSchema = z.object({
  orderNumber,
  reason: z.enum(RETURN_REASONS).or(z.literal("")),
  initial: z.enum(RETURN_REASONS).or(z.literal("")).catch("" as const),
});
