import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { dhakaDayStart } from "@/lib/dates";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/orders/enums";

export const ORDERS_PER_PAGE = 25;

const day = z
  .string()
  .refine((value) => value === "" || dhakaDayStart(value) !== null)
  .catch("");

// A bad value in the URL drops that one filter instead of failing the page.
const filtersSchema = z.object({
  q: z.string().trim().max(60).catch(""),
  status: z.enum(ORDER_STATUSES).or(z.literal("")).catch(""),
  method: z.enum(PAYMENT_METHODS).or(z.literal("")).catch(""),
  payment: z.enum(PAYMENT_STATUSES).or(z.literal("")).catch(""),
  product: z
    .string()
    .refine((value) => value === "" || isValidObjectId(value))
    .catch(""),
  from: day,
  to: day,
  page: z.coerce.number().int().min(1).max(100000).catch(1),
});

export type OrderFilters = z.output<typeof filtersSchema>;

type SearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export function readOrderFilters(params: SearchParams): OrderFilters {
  return filtersSchema.parse({
    q: one(params.q),
    status: one(params.status),
    method: one(params.method),
    payment: one(params.payment),
    product: one(params.product),
    from: one(params.from),
    to: one(params.to),
    page: one(params.page) || 1,
  });
}

// Query string for a filters link, leaving out empty values and page 1.
export function filtersQuery(filters: OrderFilters, page = filters.page): string {
  const params = new URLSearchParams();
  for (const key of ["q", "status", "method", "payment", "product", "from", "to"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}
