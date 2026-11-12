import type { OrderStatus } from "@/lib/orders/enums";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

// The only moves allowed. Delivered and returned are final; a cancelled order can be reopened.
export const STATUS_MOVES: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: [],
  returned: [],
  cancelled: ["pending"],
};

export function canMoveStatus(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_MOVES[from].includes(to);
}

// Customer details can be edited only before the order ships.
export const CUSTOMER_EDITABLE_STATUSES: readonly OrderStatus[] = ["pending", "confirmed"];

export function canEditCustomer(status: OrderStatus): boolean {
  return CUSTOMER_EDITABLE_STATUSES.includes(status);
}
