import { PaymentAccountBox } from "@/components/shop/order/PaymentAccountBox";
import { PaymentOptionPicker } from "@/components/shop/order/PaymentOptionPicker";
import { OrderField, fieldClass, labelClass } from "@/components/shop/order/OrderField";
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
  errors: Record<string, string>;
}

const invalid = (errors: Record<string, string>, field: string) =>
  errors[field] ? { "aria-invalid": true, "aria-describedby": `order-${field}-error` } : {};

export function PaymentSection({ option, onOption, method, onMethod, accounts, amounts, errors }: PaymentSectionProps) {
  const account = accounts.find((item) => item.method === method);
  const bank = method === "bank";

  return (
    <div className="space-y-4">
      <PaymentOptionPicker value={option} onChange={onOption} amounts={amounts} labelClass={labelClass} />

      {option !== "cod" && (
        <>
          <fieldset aria-describedby={errors.paymentMethod ? "order-paymentMethod-error" : undefined}>
            <legend className={labelClass}>কোন মাধ্যমে টাকা পাঠাবেন</legend>
            <div className="grid grid-cols-2 gap-2">
              {accounts.map((item) => (
                <label
                  key={item.method}
                  className={`flex items-center gap-2 rounded-md border p-3 text-[15px] font-semibold text-body ${
                    method === item.method ? "border-brand bg-brand-light" : "border-line-strong bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={item.method}
                    checked={method === item.method}
                    onChange={() => onMethod(item.method)}
                    className="accent-brand"
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

          <OrderField
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
              className={fieldClass}
              {...invalid(errors, "senderNumber")}
            />
          </OrderField>
          <OrderField id="order-transactionId" label="Transaction ID" error={errors.transactionId}>
            <input
              id="order-transactionId"
              name="transactionId"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="যেমন: 8N7A6D5C4B"
              className={`${fieldClass} uppercase placeholder:normal-case`}
              {...invalid(errors, "transactionId")}
            />
          </OrderField>
        </>
      )}
    </div>
  );
}
