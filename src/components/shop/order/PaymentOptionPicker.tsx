import type { ReactNode } from "react";

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

function detail(option: PaymentOption, amounts: OrderAmounts): ReactNode {
  if (option === "cod") return "পণ্য হাতে পেয়ে সব টাকা দিন";
  if (option === "advance_delivery") {
    return (
      <>
        ডেলিভারি চার্জে <Money amount={amounts.discount} /> ছাড়, পণ্যের দাম ডেলিভারির সময়
      </>
    );
  }
  return (
    <>
      মোট দামে <Money amount={amounts.discount} /> ছাড়
    </>
  );
}

export function PaymentOptionPicker({ value, onChange, amounts, offered, labelClass }: PaymentOptionPickerProps) {
  const options = (Object.keys(TITLES) as PaymentOption[]).filter(offered);

  return (
    <fieldset>
      <legend className={labelClass}>পেমেন্ট</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-start gap-3 rounded-md border p-3 ${
              value === option ? "border-brand bg-brand-light" : "border-line-strong bg-card"
            }`}
          >
            <input
              type="radio"
              name="paymentOption"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="mt-1 accent-brand"
            />
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-body">
                {TITLES[option]}
                {option === "advance_delivery" && (
                  <span className="rounded bg-brand px-1.5 py-0.5 text-xs font-semibold text-white">সবচেয়ে জনপ্রিয়</span>
                )}
              </span>
              <span className="mt-0.5 block text-sm text-desc">{detail(option, amounts[option])}</span>
            </span>
            <span className="text-right text-sm text-desc">
              মোট
              <span className="block text-[15px] font-semibold text-body">
                <Money amount={amounts[option].total} />
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
