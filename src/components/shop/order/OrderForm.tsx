"use client";

import { useState, type FormEvent } from "react";

import { LandingSection } from "@/components/shop/landing/LandingSection";
import { DeliveryAreaPicker } from "@/components/shop/order/DeliveryAreaPicker";
import { OrderField, fieldClass, labelClass } from "@/components/shop/order/OrderField";
import { OrderSummary } from "@/components/shop/order/OrderSummary";
import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { useOrderSubmit } from "@/components/shop/order/use-order-submit";
import { DELIVERY_AREA_LABELS, type DeliveryArea } from "@/lib/orders/limits";
import type { DeliveryCharges } from "@/lib/orders/pricing";

interface OrderFormProps {
  productId: string;
  price: number;
  deliveryCharges: DeliveryCharges;
}

export function OrderForm({ productId, price, deliveryCharges }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState<DeliveryArea>("inside_dhaka");
  const { submit, pending, errors, message, clearError } = useOrderSubmit();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    void submit({ productId, quantity, deliveryArea: area, name: text("name"), phone: text("phone"), address: text("address") });
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
        <OrderField id="order-address" label="পূর্ণ ঠিকানা" error={errors.address}>
          <textarea
            id="order-address"
            name="address"
            rows={2}
            autoComplete="street-address"
            placeholder="বাড়ি, রাস্তা, থানা, জেলা"
            className={`${fieldClass} resize-none`}
            {...invalid("address")}
          />
        </OrderField>
        <div>
          <p className={labelClass}>পরিমাণ</p>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
        <DeliveryAreaPicker value={area} onChange={setArea} charges={deliveryCharges} labelClass={labelClass} />

        <OrderSummary
          price={price}
          quantity={quantity}
          deliveryCharge={deliveryCharges[area]}
          areaLabel={DELIVERY_AREA_LABELS[area]}
        />

        {message && (
          <p role="alert" className="rounded-md bg-brand-light px-3 py-2 text-center text-sm font-medium text-brand-dark">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-brand py-4 text-xl font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
        </button>
        <p className="text-center text-[13px] text-desc">অর্ডারের পর আমরা ফোন করে কনফার্ম করব</p>
      </form>
    </LandingSection>
  );
}
