"use client";

import { useState, type FormEvent } from "react";

import { LandingSection } from "@/components/shop/landing/LandingSection";
import { CityCorporationPicker } from "@/components/shop/order/CityCorporationPicker";
import { DeliveryAreaPicker } from "@/components/shop/order/DeliveryAreaPicker";
import { LocationPicker } from "@/components/shop/order/LocationPicker";
import { OrderField, fieldClass, labelClass } from "@/components/shop/order/OrderField";
import { OrderSubmit } from "@/components/shop/order/OrderSubmit";
import { OrderSummary } from "@/components/shop/order/OrderSummary";
import { PaymentSection } from "@/components/shop/order/PaymentSection";
import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { useOrderSubmit } from "@/components/shop/order/use-order-submit";
import { usePaymentChoice } from "@/components/shop/order/use-payment-choice";
import { EMPTY_LOCATION, type LocationSelection } from "@/lib/locations/types";
import { DELIVERY_AREA_LABELS, type DeliveryArea } from "@/lib/orders/limits";
import type { PaymentAccount } from "@/lib/orders/payment-methods";
import type { DeliveryCharges, DeliveryDiscounts } from "@/lib/orders/pricing";

interface OrderFormProps {
  productId: string;
  price: number;
  deliveryCharges: DeliveryCharges;
  discounts: DeliveryDiscounts;
  accounts: PaymentAccount[];
}

const LOCATION_FIELDS = ["cityCorporation", "divisionId", "districtId", "upazilaId"];

export function OrderForm({ productId, price, deliveryCharges, discounts, accounts }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState<DeliveryArea>("inside_dhaka");
  const [cityCorporation, setCityCorporation] = useState("");
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION);
  const { submit, pending, errors, message, clearError } = useOrderSubmit();
  const payment = usePaymentChoice({ price, quantity, deliveryCharge: deliveryCharges[area], discounts, accounts, clearError });
  const activeOption = payment.option;

  // Switching between inside and outside Dhaka starts the location choice again.
  function changeArea(next: DeliveryArea) {
    if (next === area) return;
    setArea(next);
    setCityCorporation("");
    setLocation(EMPTY_LOCATION);
    LOCATION_FIELDS.forEach(clearError);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    const inside = area === "inside_dhaka";
    const advance = activeOption !== "cod";
    void submit({
      productId,
      quantity,
      deliveryArea: area,
      name: text("name"),
      phone: text("phone"),
      cityCorporation: inside ? cityCorporation : "",
      ...(inside ? EMPTY_LOCATION : location),
      address: text("address"),
      paymentOption: activeOption,
      paymentMethod: advance ? payment.method : "",
      senderNumber: advance ? text("senderNumber") : "",
      transactionId: advance ? text("transactionId") : "",
    });
  }

  const invalid = (field: string) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `order-${field}-error` } : {};

  return (
    <LandingSection id="order" title="অর্ডার করতে ফর্মটি পূরণ করুন" className="scroll-mt-14 border-t-[3px] border-brand">
      <form
        onSubmit={handleSubmit}
        onInput={(event) => clearError((event.target as HTMLInputElement).name)}
        noValidate
        className="space-y-4"
      >
        <OrderField id="order-name" label="আপনার নাম" error={errors.name}>
          <input id="order-name" name="name" type="text" autoComplete="name" placeholder="নাম লিখুন" className={fieldClass} {...invalid("name")} />
        </OrderField>
        <OrderField id="order-phone" label="মোবাইল নম্বর" error={errors.phone}>
          <input
            id="order-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className={fieldClass}
            {...invalid("phone")}
          />
        </OrderField>

        <DeliveryAreaPicker value={area} onChange={changeArea} charges={deliveryCharges} labelClass={labelClass} />
        {area === "inside_dhaka" ? (
          <CityCorporationPicker value={cityCorporation} onChange={setCityCorporation} error={errors.cityCorporation} labelClass={labelClass} />
        ) : (
          <LocationPicker value={location} onChange={setLocation} errors={errors} />
        )}

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
          areaLabel={DELIVERY_AREA_LABELS[area]}
          advance={activeOption !== "cod"}
        />

        <OrderSubmit message={message} pending={pending} advance={activeOption !== "cod"} />
      </form>
    </LandingSection>
  );
}
