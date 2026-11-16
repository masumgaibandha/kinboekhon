"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackPixel } from "@/components/tracking/pixel";

// Kept outside the component: a move from a landing page to the thank-you page mounts a new layout, and that
// navigation still needs its PageView.
let lastPath: string | null = null;

// A PageView for each client navigation; the base snippet sends the one for the first page.
export function PixelPageViews() {
  const pathname = usePathname();

  useEffect(() => {
    if (lastPath !== null && lastPath !== pathname) trackPixel("PageView");
    lastPath = pathname;
  }, [pathname]);

  return null;
}
