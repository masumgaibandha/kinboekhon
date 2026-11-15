import { z } from "zod";

import { CUSTOMER_TAGS } from "@/lib/customers/tags";

export const CUSTOMERS_PER_PAGE = 25;

export const CUSTOMER_SORTS = ["recent", "orders", "spent"] as const;
export type CustomerSort = (typeof CUSTOMER_SORTS)[number];

export const CUSTOMER_SORT_LABELS: Record<CustomerSort, string> = {
  recent: "Last order",
  orders: "Most orders",
  spent: "Most spent",
};

// A bad value in the URL drops that one filter instead of failing the page.
const filtersSchema = z.object({
  q: z.string().trim().max(60).catch(""),
  tag: z.enum(CUSTOMER_TAGS).or(z.literal("")).catch(""),
  sort: z.enum(CUSTOMER_SORTS).catch("recent"),
  page: z.coerce.number().int().min(1).max(100000).catch(1),
});

export type CustomerFilters = z.output<typeof filtersSchema>;

type SearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export function readCustomerFilters(params: SearchParams): CustomerFilters {
  return filtersSchema.parse({ q: one(params.q), tag: one(params.tag), sort: one(params.sort), page: one(params.page) || 1 });
}

// Query string for a list link, leaving out empty values, the default sort and page 1.
export function customerFiltersQuery(filters: CustomerFilters, page = filters.page): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.sort !== "recent") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}
