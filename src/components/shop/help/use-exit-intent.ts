"use client";

import { useEffect, useState } from "react";

import { canShowHelpPopup, markHelpPopupShown } from "@/components/shop/help/help-popup-state";

// Desktop with a mouse only; phones and tablets never get the popup.
const DESKTOP = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const MIN_TIME_MS = 10_000;

// True once the mouse leaves through the top of the window, after 10 seconds on the page.
export function useExitIntent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const start = Date.now();

    function handle(event: MouseEvent) {
      if (event.relatedTarget !== null || event.clientY > 0) return;
      if (!desktop.matches || Date.now() - start < MIN_TIME_MS || !canShowHelpPopup()) return;
      document.removeEventListener("mouseout", handle);
      markHelpPopupShown();
      setOpen(true);
    }

    document.addEventListener("mouseout", handle);
    return () => document.removeEventListener("mouseout", handle);
  }, []);

  return { open, close: () => setOpen(false) };
}
