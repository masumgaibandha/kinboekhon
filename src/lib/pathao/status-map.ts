import type { OrderStatus } from "@/lib/orders/enums";

// "order.in-transit" (webhook) and "In_Transit" (order info) both become "in-transit".
export function statusSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^order\./, "")
    .replace(/[\s_]+/g, "-");
}

// The Pathao statuses that finish an order; every other one only shows on the order.
const FINAL_STATUS: Record<string, OrderStatus> = {
  delivered: "delivered",
  "partial-delivery": "delivered",
  return: "returned",
  returned: "returned",
  "paid-return": "returned",
  "returned-to-merchant": "returned",
};

export function orderStatusFor(slug: string): OrderStatus | null {
  return FINAL_STATUS[slug] ?? null;
}

// "pickup-requested" becomes "Pickup requested".
export function courierStatusLabel(slug: string): string {
  const words = slug.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
