"use client";

import { useEffect, useRef, type RefObject } from "react";

// The phone bar button can be tapped mid-form, so a failed order scrolls to the first problem.
export function useScrollToProblem(formRef: RefObject<HTMLFormElement | null>, pending: boolean) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      formRef.current?.querySelector('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    wasPending.current = pending;
  }, [formRef, pending]);
}
