import type { Types } from "mongoose";

import type { OrderLocation } from "@/lib/locations/types";
import type { CAPI_STATUSES, OrderStatus, PaymentMethod, PaymentOption, PaymentStatus } from "@/lib/orders/enums";
import type { TurnstileResult } from "@/lib/turnstile";

export const HISTORY_KINDS = ["status", "edit", "payment"] as const;

// A status change, a customer edit or a payment review (for the last two, status holds the status at that moment).
export interface OrderHistoryEntry {
  kind: (typeof HISTORY_KINDS)[number];
  status: OrderStatus;
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
  tracking?: OrderTracking;
  capiPurchase?: { status: (typeof CAPI_STATUSES)[number]; error?: string };
  createdAt: Date;
  updatedAt: Date;
}
