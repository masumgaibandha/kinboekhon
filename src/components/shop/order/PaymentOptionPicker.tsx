import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { PaymentOption } from "@/lib/orders/enums";
import type { OrderAmounts } from "@/lib/orders/pricing";

interface PaymentOptionPickerProps {
  value: PaymentOption;
  onChange: (option: PaymentOption) => void;
  amounts: Record<PaymentOption, OrderAmounts>;
  labelClass: string;
}

const TITLES: Record<PaymentOption, string> = {
  cod: "ক্যাশ অন ডেলিভারি",
  advance_full: "পুরো টাকা অগ্রিম",
};

function detail(option: PaymentOption, amounts: OrderAmounts): ReactNode {
  if (option === "cod") return "পণ্য হাতে পেয়ে টাকা দিন";
  return (
    <>
      <Money amount={amounts.discount} /> ছাড়
    </>
  );
}

export function PaymentOptionPicker({ value, onChange, amounts, labelClass }: PaymentOptionPickerProps) {
  // An advance option with nothing to send now is not offered.
  const options = (Object.keys(TITLES) as PaymentOption[]).filter(
    (option) => option === "cod" || amounts[option].advanceAmount > 0,
  );

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
              <span className="block text-[15px] font-semibold text-body">{TITLES[option]}</span>
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
