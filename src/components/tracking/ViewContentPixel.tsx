"use client";

import { useEffect, useRef } from "react";

import { productData, randomEventId, trackPixel } from "@/components/tracking/pixel";

interface ViewContentPixelProps {
  productId: string;
  name: string;
  price: number;
}

export function ViewContentPixel({ productId, name, price }: ViewContentPixelProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackPixel("ViewContent", productData(productId, price, 1, name), randomEventId("vc"));
  }, [productId, name, price]);

  return null;
}
