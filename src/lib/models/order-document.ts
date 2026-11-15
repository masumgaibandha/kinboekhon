import type { Types } from "mongoose";

import type { OrderLocation } from "@/lib/locations/types";
import type { CAPI_STATUSES, CallOutcome, OrderStatus, PaymentMethod, PaymentOption, PaymentStatus, ReturnReason } from "@/lib/orders/enums";
import type { TurnstileResult } from "@/lib/turnstile";

export const HISTORY_KINDS = ["status", "edit", "payment", "call", "return_reason"] as const;

// A status change, a customer edit, a payment review, a call or a return reason (for all but the first, status holds the status at that moment).
export interface OrderHistoryEntry {
  kind: (typeof HISTORY_KINDS)[number];
  status: OrderStatus;
  at: Date;
  note: string;
  // Set only on a call entry.
  outcome?: CallOutcome;
}

export interface OrderCall {
  outcome: CallOutcome;
  at: Date;
  note: string;
}

export interface OrderTracking {
  // The address itself is kept for the Conversions API (M14); the admin only sees the hash.
  ip?: string;
  ipHash?: string;
  userAgent?: string;
  turnstile?: TurnstileResult;
  fbp?: string;
  fbc?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export interface OrderDocument {
  orderNumber: string;
  publicId: string;
  product: { productId: Types.ObjectId; name: string; slug: string; image: string | null; price: number };
  quantity: number;
  subtotal: number;
  // Missing on orders placed while delivery was free.
  deliveryCharge?: number;
  discount: number;
  total: number;
  customer: { name: string; phone: string; address: string; location: OrderLocation };
  status: OrderStatus;
  statusHistory: OrderHistoryEntry[];
  payment: {
    option: PaymentOption;
    method: PaymentMethod;
    status: PaymentStatus;
    advanceAmount: number;
    dueOnDelivery: number;
    senderNumber?: string;
    transactionId?: string;
    transactionIdNormalized?: string;
    reviewNote?: string;
    reviewedAt?: Date;
  };
  adminNote: string;
  // The phone was tagged Blocked when the order was placed.
  customerBlocked?: boolean;
  // Set by the admin on a cancelled or returned order.
  returnReason?: ReturnReason;
  // The latest call, for the orders list and its filter.
  lastCall?: OrderCall;
  tracking?: OrderTracking;
  capiPurchase?: { status: (typeof CAPI_STATUSES)[number]; error?: string };
  createdAt: Date;
  updatedAt: Date;
}
