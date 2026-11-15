export const CUSTOMER_TAGS = ["vip", "risky", "blocked"] as const;
export type CustomerTag = (typeof CUSTOMER_TAGS)[number];

export const CUSTOMER_TAG_LABELS: Record<CustomerTag, string> = {
  vip: "VIP",
  risky: "Risky",
  blocked: "Blocked",
};

// Tags in their fixed display order, whatever order they were saved in.
export function sortedTags(tags: readonly string[]): CustomerTag[] {
  return CUSTOMER_TAGS.filter((tag) => tags.includes(tag));
}
