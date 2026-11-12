"use client";

import { useEffect, useState } from "react";

interface CopyButtonProps {
  value: string;
  // What is copied, for screen readers, for example "বিকাশ নম্বর".
  label: string;
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} কপি করুন`}
      className="shrink-0 rounded-md border border-brand bg-card px-3 py-1.5 text-sm font-semibold text-brand-dark"
    >
      <span aria-live="polite">{state === "copied" ? "কপি হয়েছে" : state === "failed" ? "কপি হয়নি" : "কপি"}</span>
    </button>
  );
}
