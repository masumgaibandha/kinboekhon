"use client";

import { useState } from "react";

import type { ProductCardData } from "@/lib/catalog";

// The "এটাও নিন" products added to the order, and every line for the summary.
export function useExtras(main: { name: string; price: number; quantity: number }, upsells: ProductCardData[]) {
  const [added, setAdded] = useState<Record<string, number>>({});
  const extras = upsells.filter((product) => added[product.id]);
  const lines = [main, ...extras.map((product) => ({ name: product.name, price: product.price, quantity: added[product.id] }))];

  function change(id: string, quantity: number) {
    setAdded((current) => {
      const next = { ...current };
      if (quantity > 0) next[id] = quantity;
      else delete next[id];
      return next;
    });
  }

  const payload = () => extras.map((product) => ({ productId: product.id, quantity: added[product.id] }));
  return { added, change, lines, payload };
}
