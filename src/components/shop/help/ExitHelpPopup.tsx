"use client";

import { HelpDialog, type HelpDialogProps } from "@/components/shop/help/HelpDialog";
import { useExitIntent } from "@/components/shop/help/use-exit-intent";

// The dialog and its Turnstile check are mounted only once the popup opens.
export function ExitHelpPopup(props: Omit<HelpDialogProps, "onClose">) {
  const { open, close } = useExitIntent();
  return open ? <HelpDialog {...props} onClose={close} /> : null;
}
