"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { PaymentOption } from "@/lib/orders/enums";
import type { OrderAmounts } from "@/lib/orders/pricing";

interface PaymentOptionPickerProps {
  value: PaymentOption;
  onChange: (option: PaymentOption) => void;
  amounts: Record<PaymentOption, OrderAmounts>;
  offered: (option: PaymentOption) => boolean;
  labelClass: string;
}

// Shown in this order.
const TITLES: Record<PaymentOption, string> = {
  advance_delivery: "ডেলিভারি চার্জ অগ্রিম",
  advance_full: "পুরো টাকা অগ্রিম",
  cod: "ক্যাশ অন ডেলিভারি",
};

function note(option: PaymentOption, amounts: OrderAmounts): ReactNode {
  if (option === "cod") return "পণ্য হাতে পেয়ে সব টাকা দিন";
  return (
    <>
      {option === "advance_delivery" ? "ডেলিভারি চার্জে" : "মোট দামে"} <Money amount={amounts.discount} /> ছাড়
    </>
  );
}

function Title({ option }: { option: PaymentOption }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-body">
      {TITLES[option]}
      {option === "advance_delivery" && (
        <span className="rounded bg-brand px-1.5 py-0.5 text-xs font-semibold text-white">সবচেয়ে জনপ্রিয়</span>
      )}
    </span>
  );
}

function Total({ amount }: { amount: number }) {
  return (
    <span className="shrink-0 text-[15px] font-semibold text-body">
      <Money amount={amount} />
    </span>
  );
}

export function PaymentOptionPicker({ value, onChange, amounts, offered, labelClass }: PaymentOptionPickerProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const options = (Object.keys(TITLES) as PaymentOption[]).filter(offered);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  function choose(option: PaymentOption) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div ref={box} className="relative">
      <span id={`${id}-label`} className={labelClass}>
        কীভাবে টাকা দেবেন
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen(!open)}
        className={`flex min-h-12 w-full items-center gap-3 rounded-xl border border-brand bg-card px-4 py-2.5 text-left outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-brand/25 ${
          open ? "ring-3 ring-brand/25" : ""
        }`}
      >
        <span id={`${id}-value`} className="flex flex-1 items-center justify-between gap-3">
          <Title option={value} />
          <Total amount={amounts[value].total} />
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className={`size-5 shrink-0 text-muted ${open ? "rotate-180" : ""}`}>
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line-strong bg-card shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => choose(option)}
              className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 ${
                value === option ? "bg-brand-light" : ""
              }`}
            >
              <span className="min-w-0 flex-1">
                <Title option={option} />
                <span className="mt-0.5 block truncate text-sm text-desc">{note(option, amounts[option])}</span>
              </span>
              <Total amount={amounts[option].total} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
