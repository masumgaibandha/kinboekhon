"use client";

import { useRef, useState, type FormEvent } from "react";

import { LandingSection } from "@/components/shop/landing/LandingSection";
import { ContactFields } from "@/components/shop/order/ContactFields";
import { LocationPicker } from "@/components/shop/order/LocationPicker";
import { OrderField, fieldClass, labelClass } from "@/components/shop/order/OrderField";
import { OrderSubmit } from "@/components/shop/order/OrderSubmit";
import { OrderSummary } from "@/components/shop/order/OrderSummary";
import { PaymentSection } from "@/components/shop/order/PaymentSection";
import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { useDraft } from "@/components/shop/order/use-draft";
import { useOrderSubmit, type OrderFields } from "@/components/shop/order/use-order-submit";
import { usePaymentChoice } from "@/components/shop/order/use-payment-choice";
import { useTurnstile } from "@/components/shop/order/use-turnstile";
import { EMPTY_LOCATION, type LocationSelection } from "@/lib/locations/types";
import type { PaymentAccount } from "@/lib/orders/payment-methods";

interface OrderFormProps {
  productId: string;
  price: number;
  fullAdvanceDiscount: number;
  accounts: PaymentAccount[];
}

export function OrderForm({ productId, price, fullAdvanceDiscount, accounts }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION);
  const { submit, pending, errors, message, clearError } = useOrderSubmit();
  const { ref: turnstileRef, failed: turnstileFailed, getToken, reset } = useTurnstile();
  const payment = usePaymentChoice({ price, quantity, fullAdvanceDiscount, accounts, clearError });
  const activeOption = payment.option;
  const formRef = useRef<HTMLFormElement>(null);
  const draft = useDraft(productId, () => (formRef.current ? collect(formRef.current) : null));

  function collect(element: HTMLFormElement): OrderFields {
    const form = new FormData(element);
    const text = (name: string) => String(form.get(name) ?? "");
    const advance = activeOption !== "cod";
    return {
      productId,
      quantity,
      name: text("name"),
      phone: text("phone"),
      ...location,
      address: text("address"),
      paymentOption: activeOption,
      paymentMethod: advance ? payment.method : "",
      senderNumber: advance ? text("senderNumber") : "",
      transactionId: advance ? text("transactionId") : "",
      draftKey: draft.draftKey(),
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(collect(event.currentTarget), { getToken, reset }, draft.finish);
  }

  const invalid = (field: string) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `order-${field}-error` } : {};

  return (
    <LandingSection id="order" title="অর্ডার করতে ফর্মটি পূরণ করুন" className="scroll-mt-14 border-t-[3px] border-brand">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onBlur={draft.save}
        onInput={(event) => clearError((event.target as HTMLInputElement).name)}
        noValidate
        className="space-y-4"
      >
        <ContactFields errors={errors} />

        <LocationPicker value={location} onChange={setLocation} errors={errors} />

        <OrderField id="order-address" label="ঠিকানা (বাড়ি, রাস্তা, এলাকা)" error={errors.address}>
          <textarea
            id="order-address"
            name="address"
            rows={2}
            autoComplete="street-address"
            placeholder="যেমন: বাড়ি নম্বর, রাস্তা, এলাকার নাম"
            className={`${fieldClass} resize-none`}
            {...invalid("address")}
          />
        </OrderField>
        <div>
          <p className={labelClass}>পরিমাণ</p>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>

        {accounts.length > 0 && (
          <PaymentSection
            option={activeOption}
            onOption={payment.changeOption}
            method={payment.method}
            onMethod={payment.changeMethod}
            accounts={accounts}
            amounts={payment.amounts}
            errors={errors}
          />
        )}

        <OrderSummary
          price={price}
          quantity={quantity}
          amounts={payment.amounts[activeOption]}
          advance={activeOption !== "cod"}
        />

        <OrderSubmit
          message={message}
          checkFailed={turnstileFailed}
          turnstileRef={turnstileRef}
          pending={pending}
          advance={activeOption !== "cod"}
        />
      </form>
    </LandingSection>
  );
}
