"use client";

import { useEffect } from "react";

import { takeNewOrder } from "@/components/tracking/new-order";
import { trackPixel } from "@/components/tracking/pixel";
import { orderContent, type ContentLine } from "@/lib/meta/order-content";

interface PurchasePixelProps {
  publicId: string;
  orderNumber: string;
  lines: ContentLine[];
}

// Same event_id and data as the server Purchase, so Meta counts the order once.
export function PurchasePixel({ publicId, orderNumber, lines }: PurchasePixelProps) {
  useEffect(() => {
    if (!takeNewOrder(publicId)) return;
    trackPixel("Purchase", orderContent(lines), `purchase_${orderNumber}`);
  }, [publicId, orderNumber, lines]);

  return null;
}
