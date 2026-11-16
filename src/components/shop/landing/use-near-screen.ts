"use client";

import { useEffect, useState, type RefObject } from "react";

// True once the element comes within `margin` of the screen. Chrome's own lazy loading starts much earlier,
// so images far below the first screen would otherwise download together with the main image.
export function useNearScreen(ref: RefObject<Element | null>, enabled: boolean, margin = "400px"): boolean {
  const [near, setNear] = useState(!enabled);

  useEffect(() => {
    const element = ref.current;
    if (near || !element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, near, margin]);

  return near;
}
