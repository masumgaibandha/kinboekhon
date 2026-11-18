import { CashIcon } from "@/components/shop/icons";
import { PaymentAccountBox } from "@/components/shop/order/PaymentAccountBox";
import { PaymentOptionPicker } from "@/components/shop/order/PaymentOptionPicker";
import { StepField, inputClass, stepLabelClass } from "@/components/shop/order/StepField";
import { CheckIcon } from "@/components/shop/order/step-icons";
import { Money } from "@/components/ui/Money";
import type { PaymentOption } from "@/lib/orders/enums";
import { METHOD_LABELS_BN, type AdvanceMethod, type PaymentAccount } from "@/lib/orders/payment-methods";
import type { OrderAmounts } from "@/lib/orders/pricing";

interface PaymentSectionProps {
  option: PaymentOption;
  onOption: (option: PaymentOption) => void;
  method: AdvanceMethod | "";
  onMethod: (method: AdvanceMethod) => void;
  accounts: PaymentAccount[];
  amounts: Record<PaymentOption, OrderAmounts>;
  offered: (option: PaymentOption) => boolean;
  errors: Record<string, string>;
}

const invalid = (errors: Record<string, string>, field: string) =>
  errors[field] ? { "aria-invalid": true, "aria-describedby": `order-${field}-error` } : {};

// Without advance payment accounts only cash on delivery is offered, so there is nothing to choose.
function CashOnDeliveryOnly() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand bg-brand-light px-4 py-3">
      <CashIcon className="size-6 shrink-0 text-brand" />
      <div>
        <p className="text-[15px] font-semibold text-body">ক্যাশ অন ডেলিভারি</p>
        <p className="text-sm text-desc">পণ্য হাতে পেয়ে সব টাকা দিন</p>
      </div>
    </div>
  );
}

export function PaymentSection({ option, onOption, method, onMethod, accounts, amounts, offered, errors }: PaymentSectionProps) {
  const account = accounts.find((item) => item.method === method);
  const bank = method === "bank";
  if (accounts.length === 0) return <CashOnDeliveryOnly />;
  const saving = amounts[option].discount;

  return (
    <div className="space-y-4">
      <div>
        <PaymentOptionPicker value={option} onChange={onOption} amounts={amounts} offered={offered} labelClass={stepLabelClass} />
        {saving > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-success">
            <CheckIcon />
            এই পেমেন্টে আপনি <Money amount={saving} bold /> ছাড় পাচ্ছেন
          </p>
        )}
      </div>

      {option !== "cod" && (
        <>
          <fieldset aria-describedby={errors.paymentMethod ? "order-paymentMethod-error" : undefined}>
            <legend className={stepLabelClass}>কোন মাধ্যমে টাকা পাঠাবেন</legend>
            <div className="flex flex-wrap gap-2">
              {accounts.map((item) => (
                <label
                  key={item.method}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold has-focus-visible:ring-2 has-focus-visible:ring-brand ${
                    method === item.method ? "border-brand bg-brand text-white" : "border-line-strong bg-card text-body"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={item.method}
                    checked={method === item.method}
                    onChange={() => onMethod(item.method)}
                    className="sr-only"
                  />
                  {METHOD_LABELS_BN[item.method]}
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p id="order-paymentMethod-error" className="mt-1.5 text-sm font-medium text-brand-dark">
                {errors.paymentMethod}
              </p>
            )}
          </fieldset>

          {account && <PaymentAccountBox account={account} amount={amounts[option].advanceAmount} />}

          <StepField
            id="order-senderNumber"
            label={bank ? "যে অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন (অ্যাকাউন্ট নম্বর)" : "যে নম্বর থেকে টাকা পাঠিয়েছেন"}
            error={errors.senderNumber}
          >
            <input
              id="order-senderNumber"
              name="senderNumber"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={bank ? "অ্যাকাউন্ট নম্বর" : "01XXXXXXXXX"}
              className={inputClass}
              {...invalid(errors, "senderNumber")}
            />
          </StepField>
          <StepField id="order-transactionId" label="ট্রানজ্যাকশন আইডি (TrxID)" error={errors.transactionId}>
            <input
              id="order-transactionId"
              name="transactionId"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="যেমন: 8N7A6D5C4B"
              className={`${inputClass} uppercase placeholder:normal-case`}
              {...invalid(errors, "transactionId")}
            />
          </StepField>
        </>
      )}
    </div>
  );
}
