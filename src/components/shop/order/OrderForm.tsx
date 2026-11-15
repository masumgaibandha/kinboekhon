"use client";

import { useRef, useState, type FormEvent } from "react";

import { LandingSection } from "@/components/shop/landing/LandingSection";
import { CheckoutProduct } from "@/components/shop/order/CheckoutProduct";
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
import { useInitiateCheckout } from "@/components/tracking/use-initiate-checkout";
import { EMPTY_LOCATION, type LocationSelection } from "@/lib/locations/types";
import type { PaymentAccount } from "@/lib/orders/payment-methods";
import { deliveryChargeFor, isDhakaCity, type PricingSettings } from "@/lib/orders/pricing";
import type { ProductImage } from "@/lib/product-images";

interface OrderFormProps {
  productId: string;
  name: string;
  image: ProductImage | null;
  price: number;
  pricing: PricingSettings;
  accounts: PaymentAccount[];
}

export function OrderForm({ productId, name, image, price, pricing, accounts }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION);
  const { submit, pending, errors, message, clearError } = useOrderSubmit();
  const { ref: turnstileRef, failed: turnstileFailed, getToken, reset } = useTurnstile();
  // Until the place is picked, the summary uses the outside charge and shows both.
  const dhakaCity = location.upazilaId ? isDhakaCity(location.upazilaId) : null;
  const deliveryCharge = deliveryChargeFor(dhakaCity === true, pricing);
  const payment = usePaymentChoice({ price, quantity, deliveryCharge, discounts: pricing, accounts, clearError });
  const activeOption = payment.option;
  const formRef = useRef<HTMLFormElement>(null);
  const draft = useDraft(productId, () => (formRef.current ? collect(formRef.current) : null));
  const startCheckout = useInitiateCheckout(productId, price, draft.draftKey);

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
    <LandingSection id="order" title="অর্ডার করতে ফর্মটি পূরণ করুন" className="scroll-mt-14 border-t-[3px] border-brand lg:scroll-mt-20">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onBlur={draft.save}
        onInput={(event) => {
          startCheckout(quantity);
          clearError((event.target as HTMLInputElement).name);
        }}
        noValidate
        className="space-y-4 lg:grid lg:grid-cols-[58fr_42fr] lg:items-start lg:gap-8 lg:space-y-0"
      >
        {/* Phone: one column. From 1024px: customer fields left, the summary card right. */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          <ContactFields errors={errors} />

          <div className="lg:col-span-2">
            <LocationPicker value={location} onChange={setLocation} errors={errors} />
          </div>

          <div className="lg:col-span-2">
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
          </div>
        </div>

        {/* Desktop shows the totals before the payment options, phones after. */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4 lg:space-y-0 lg:rounded-lg lg:border lg:border-line-strong lg:p-5">
          <CheckoutProduct name={name} image={image} price={price} />
          <div>
            <p className={labelClass}>পরিমাণ</p>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>

          {accounts.length > 0 && (
            <div className="lg:order-1">
              <PaymentSection
                option={activeOption}
                onOption={payment.changeOption}
                method={payment.method}
                onMethod={payment.changeMethod}
                accounts={accounts}
                amounts={payment.amounts}
                offered={payment.offered}
                errors={errors}
              />
            </div>
          )}

          <OrderSummary
            price={price}
            quantity={quantity}
            amounts={payment.amounts[activeOption]}
            option={activeOption}
            dhakaCity={dhakaCity}
            charges={{ dhakaCity: pricing.deliveryChargeDhakaCity, outside: pricing.deliveryChargeOutside }}
          />

          <div className="contents space-y-4 lg:order-2 lg:block">
            <OrderSubmit
              message={message}
              checkFailed={turnstileFailed}
              turnstileRef={turnstileRef}
              pending={pending}
              advance={activeOption !== "cod"}
            />
          </div>
        </div>
      </form>
    </LandingSection>
  );
}
