"use client";

import { useRef, useState, type FormEvent } from "react";

import { CheckoutAside } from "@/components/shop/order/CheckoutAside";
import { CheckoutProduct } from "@/components/shop/order/CheckoutProduct";
import { AddressField, ContactFields, withCountryCode } from "@/components/shop/order/ContactFields";
import { LocationPicker } from "@/components/shop/order/LocationPicker";
import { OrderStep, cardClass } from "@/components/shop/order/OrderStep";
import { OrderSubmit } from "@/components/shop/order/OrderSubmit";
import { OrderSummary } from "@/components/shop/order/OrderSummary";
import { PaymentSection } from "@/components/shop/order/PaymentSection";
import { PinIcon, UserIcon, WalletIcon } from "@/components/shop/order/step-icons";
import { UpsellPicker } from "@/components/shop/order/UpsellPicker";
import { useDraft } from "@/components/shop/order/use-draft";
import { useExtras } from "@/components/shop/order/use-extras";
import { useOrderSubmit, type OrderFields } from "@/components/shop/order/use-order-submit";
import { usePaymentChoice } from "@/components/shop/order/use-payment-choice";
import { useScrollToProblem } from "@/components/shop/order/use-scroll-to-problem";
import { useTurnstile } from "@/components/shop/order/use-turnstile";
import { useInitiateCheckout } from "@/components/tracking/use-initiate-checkout";
import type { ProductCardData } from "@/lib/catalog";
import { EMPTY_LOCATION, type LocationSelection } from "@/lib/locations/types";
import type { PaymentAccount } from "@/lib/orders/payment-methods";
import { deliveryChargeFor, isDhakaCity, itemsSubtotal, type PricingSettings } from "@/lib/orders/pricing";
import type { ProductImage } from "@/lib/product-images";

interface OrderFormProps {
  productId: string;
  name: string;
  image: ProductImage | null;
  price: number;
  pricing: PricingSettings;
  accounts: PaymentAccount[];
  // "এটাও নিন" products for this page.
  upsells: ProductCardData[];
}

export function OrderForm({ productId, name, image, price, pricing, accounts, upsells }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const extras = useExtras({ name, price, quantity }, upsells);
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION);
  const { submit, pending, errors, message, clearError } = useOrderSubmit();
  const { ref: turnstileRef, failed: turnstileFailed, getToken, reset } = useTurnstile();
  // Until the place is picked, the summary uses the outside charge and shows both.
  const dhakaCity = location.upazilaId ? isDhakaCity(location.upazilaId) : null;
  const deliveryCharge = deliveryChargeFor(dhakaCity === true, pricing);
  const payment = usePaymentChoice({ subtotal: itemsSubtotal(extras.lines), deliveryCharge, discounts: pricing, accounts, clearError });
  const activeOption = payment.option;
  const amounts = payment.amounts[activeOption];
  const formRef = useRef<HTMLFormElement>(null);
  const draft = useDraft(productId, () => (formRef.current ? collect(formRef.current) : null));
  const startCheckout = useInitiateCheckout(productId, price, draft.draftKey);
  useScrollToProblem(formRef, pending);

  function collect(element: HTMLFormElement): OrderFields {
    const form = new FormData(element);
    const text = (name: string) => String(form.get(name) ?? "");
    const advance = activeOption !== "cod";
    return {
      productId,
      quantity,
      extras: extras.payload(),
      name: text("name"),
      phone: withCountryCode(text("phone")),
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

  const product = <CheckoutProduct name={name} image={image} price={price} quantity={quantity} onQuantity={setQuantity} />;
  const summary = (
    <OrderSummary
      lines={extras.lines}
      amounts={amounts}
      option={activeOption}
      dhakaCity={dhakaCity}
      charges={{ dhakaCity: pricing.deliveryChargeDhakaCity, outside: pricing.deliveryChargeOutside }}
    />
  );

  return (
    <section id="order" aria-labelledby="order-title" className="mt-2.5 scroll-mt-14 px-3 pt-5 lg:mt-6 lg:scroll-mt-20 lg:px-0 lg:pt-2">
      <h2 id="order-title" className="mb-4 text-[22px] font-bold leading-snug text-heading lg:mb-5">
        অর্ডার করতে ফর্মটি পূরণ করুন
      </h2>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onBlur={draft.save}
        onInput={(event) => {
          startCheckout(quantity);
          clearError((event.target as HTMLInputElement).name);
        }}
        noValidate
        className="flex flex-col gap-4 lg:grid lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-6"
      >
        {/* Phone: one column, product first and the order button as a bar at the bottom. From 1024px: steps left, summary right. */}
        <div className="space-y-4 [&_:is(input,select,textarea)]:scroll-mb-28 lg:[&_:is(input,select,textarea)]:scroll-mb-0">
          <div className={`${cardClass} lg:hidden`}>{product}</div>

          <OrderStep number={1} title="আপনার তথ্য" icon={<UserIcon />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactFields errors={errors} />
            </div>
          </OrderStep>

          <OrderStep number={2} title="ডেলিভারির ঠিকানা" icon={<PinIcon />}>
            <div className="space-y-4">
              <LocationPicker value={location} onChange={setLocation} errors={errors} />
              <AddressField errors={errors} />
            </div>
          </OrderStep>

          <OrderStep number={3} title="পেমেন্ট" icon={<WalletIcon />}>
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
          </OrderStep>

          <UpsellPicker products={upsells} added={extras.added} onChange={extras.change} />

          <div className={`${cardClass} lg:hidden`}>
            <h3 className="mb-3 text-[17px] font-bold text-heading">দামের হিসাব</h3>
            {summary}
          </div>
        </div>

        <CheckoutAside product={product} summary={summary}>
          <OrderSubmit
            message={message}
            checkFailed={turnstileFailed}
            turnstileRef={turnstileRef}
            pending={pending}
            advance={activeOption !== "cod"}
            total={amounts.total}
          />
        </CheckoutAside>
      </form>
    </section>
  );
}
