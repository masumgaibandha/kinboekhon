"use client";

import { useEffect } from "react";

import { takeNewOrder } from "@/components/tracking/new-order";
import { productData, trackPixel } from "@/components/tracking/pixel";

interface PurchasePixelProps {
  publicId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  total: number;
  quantity: number;
}

// Same event_id as the server Purchase, so Meta counts the order once.
export function PurchasePixel({ publicId, orderNumber, productId, productName, total, quantity }: PurchasePixelProps) {
  useEffect(() => {
    if (!takeNewOrder(publicId)) return;
    trackPixel("Purchase", productData(productId, total, quantity, productName), `purchase_${orderNumber}`);
  }, [publicId, orderNumber, productId, productName, total, quantity]);

  return null;
}
