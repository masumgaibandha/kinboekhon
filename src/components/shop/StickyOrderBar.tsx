"use client";

import { useEffect, useState } from "react";

import { formatTaka } from "@/lib/money";

interface StickyOrderBarProps {
  price: number;
  oldPrice: number | null;
}

export function StickyOrderBar({ price, oldPrice }: StickyOrderBarProps) {
  const [hidden, setHidden] = useState(false);

  // Hidden while the order form is on screen or already scrolled past.
  useEffect(() => {
    const form = document.getElementById("order");
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) => {
      setHidden(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={hidden}
      inert={hidden}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="text-xl font-bold text-brand">{formatTaka(price)}</p>
          {oldPrice !== null && oldPrice > price && <p className="text-sm text-muted line-through">{formatTaka(oldPrice)}</p>}
        </div>
        <a href="#order" className="rounded-md bg-brand px-6 py-3 text-lg font-bold text-white">
          অর্ডার করুন
        </a>
      </div>
    </div>
  );
}
