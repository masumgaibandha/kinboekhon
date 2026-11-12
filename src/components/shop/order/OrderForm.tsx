"use client";

import { useState, type FormEvent } from "react";

import { LandingSection } from "@/components/shop/landing/LandingSection";
import { DeliveryAreaPicker } from "@/components/shop/order/DeliveryAreaPicker";
import { OrderSummary } from "@/components/shop/order/OrderSummary";
import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { DELIVERY_AREA_LABELS, type DeliveryArea } from "@/lib/orders/limits";

interface OrderFormProps {
  price: number;
  deliveryCharges: Record<DeliveryArea, number>;
}

const fieldClass =
  "w-full rounded-md border border-line-strong bg-card p-3 text-base text-body outline-none placeholder:text-muted focus:border-brand";
const labelClass = "mb-1.5 block text-[15px] font-semibold text-body";

export function OrderForm({ price, deliveryCharges }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState<DeliveryArea>("inside_dhaka");

  // Orders are submitted from M7 on; until then the form shows the layout and the live total.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <LandingSection id="order" title="অর্ডার করতে ফর্মটি পূরণ করুন" className="scroll-mt-14 border-t-[3px] border-brand">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="order-name" className={labelClass}>
            আপনার নাম
          </label>
          <input id="order-name" name="name" type="text" autoComplete="name" placeholder="নাম লিখুন" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="order-phone" className={labelClass}>
            মোবাইল নম্বর
          </label>
          <input
            id="order-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="order-address" className={labelClass}>
            পূর্ণ ঠিকানা
          </label>
          <textarea
            id="order-address"
            name="address"
            rows={2}
            autoComplete="street-address"
            placeholder="বাড়ি, রাস্তা, থানা, জেলা"
            className={`${fieldClass} resize-none`}
          />
        </div>
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

        <button type="submit" disabled className="w-full rounded-md bg-brand py-4 text-xl font-bold text-white disabled:opacity-60">
          অর্ডার কনফার্ম করুন
        </button>
        <p className="text-center text-[13px] text-desc">অর্ডারের পর আমরা ফোন করে কনফার্ম করব</p>
      </form>
    </LandingSection>
  );
}
