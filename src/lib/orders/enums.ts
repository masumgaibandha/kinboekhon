export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Orders that passed the confirmation call, whatever happened to them after it.
export const CONFIRMED_STATUSES: OrderStatus[] = ["confirmed", "shipped", "delivered", "returned"];

export const PAYMENT_OPTIONS = ["cod", "advance_delivery", "advance_full"] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];

export const PAYMENT_METHODS = ["cod", "bkash", "nagad", "rocket", "bank"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["cod", "submitted", "verified", "rejected"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const CAPI_STATUSES = ["pending", "sent", "failed"] as const;

// What happened when the admin called the customer about an order.
export const CALL_OUTCOMES = ["agreed_to_wait", "declined", "no_answer", "call_later"] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

// Why a cancelled or returned order failed, set by the admin.
export const RETURN_REASONS = [
  "refused",
  "unreachable",
  "wrong_address",
  "courier_delay",
  "damaged",
  "wrong_item",
  "fake_order",
] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number];
