"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { trackPixel } from "@/components/tracking/pixel";

// A PageView for each client navigation; the base snippet sends the one for the first page.
export function PixelPageViews() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current !== null && last.current !== pathname) trackPixel("PageView");
    last.current = pathname;
  }, [pathname]);

  return null;
}
