"use client";

import { useRef } from "react";

import { productData, trackPixel } from "@/components/tracking/pixel";

// The first input in the order form: Pixel and server get the same event_id, ic_<draftKey>.
export function useInitiateCheckout(productId: string, price: number, draftKey: () => string) {
  const sent = useRef(false);

  return function start(quantity: number) {
    if (sent.current) return;
    sent.current = true;
    const eventId = `ic_${draftKey()}`;
    trackPixel("InitiateCheckout", productData(productId, price * quantity, quantity), eventId);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "InitiateCheckout", eventId, productId, quantity }),
      keepalive: true,
    }).catch(() => {});
  };
}
