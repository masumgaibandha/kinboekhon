import { z } from "zod";

import { ORDER_NUMBER_PATTERN } from "@/lib/orders/admin-order-detail";

const orderNumber = z.string().regex(ORDER_NUMBER_PATTERN, "Order not found.");
const pickedId = (message: string) => z.string().regex(/^[1-9]\d{0,9}$/, message).transform(Number);

export const pathaoOrderSchema = z.object({ orderNumber });

// Bulk send from the orders list: one page at most.
export const pathaoBulkSchema = z.object({
  orderNumbers: z.array(orderNumber).min(1, "Tick at least one confirmed order.").max(25, "Send at most 25 orders at once."),
});

// The Pathao city and zone the admin picked for an order; the area may stay empty.
export const pathaoLocationSchema = z.object({
  orderNumber,
  cityId: pickedId("Pick a city."),
  zoneId: pickedId("Pick a zone."),
  areaId: pickedId("Pick an area.").or(z.literal("").transform(() => null)),
});

export const placeIdSchema = z.number().int().positive().max(9_999_999_999);

// A Pathao status update; unknown fields are ignored.
export const pathaoWebhookSchema = z.object({
  consignment_id: z.string().trim().min(1).max(40).optional(),
  event: z.string().trim().min(1).max(60).optional(),
  timestamp: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional()
    .catch(undefined),
  delivery_fee: z.number().nonnegative().optional().catch(undefined),
  reason: z.string().trim().max(200).optional().catch(undefined),
});
