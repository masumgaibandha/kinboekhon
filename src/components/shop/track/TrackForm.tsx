"use client";

import { useState, type FormEvent } from "react";

import { OrderField, fieldClass } from "@/components/shop/order/OrderField";
import { TrackResult } from "@/components/shop/track/TrackResult";
import type { TrackedOrder } from "@/lib/orders/order-status";

interface TrackFormProps {
  initial: { orderNumber: string; phone: string } | null;
  whatsappNumber: string;
}

interface StatusResponse {
  order?: TrackedOrder;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const TRY_AGAIN = "ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।";

export function TrackForm({ initial, whatsappNumber }: TrackFormProps) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setErrors({});
    setMessage("");
    setOrder(null);
    try {
      const response = await fetch("/api/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: String(form.get("orderNumber") ?? ""), phone: String(form.get("phone") ?? "") }),
      });
      const data = (await response.json()) as StatusResponse;
      if (data.order) setOrder(data.order);
      else if (data.fieldErrors) setErrors(data.fieldErrors);
      else setMessage(data.message ?? TRY_AGAIN);
    } catch {
      setMessage(TRY_AGAIN);
    } finally {
      setPending(false);
    }
  }

  const invalid = (field: string) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `track-${field}-error` } : {};

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-line bg-card px-5 py-5">
        <OrderField id="track-orderNumber" label="অর্ডার নম্বর" error={errors.orderNumber}>
          <input
            id="track-orderNumber"
            name="orderNumber"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="যেমন: KE10001"
            defaultValue={initial?.orderNumber}
            className={`${fieldClass} uppercase placeholder:normal-case`}
            {...invalid("orderNumber")}
          />
        </OrderField>
        <OrderField id="track-phone" label="অর্ডারের সময় দেওয়া মোবাইল নম্বর" error={errors.phone}>
          <input
            id="track-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            defaultValue={initial?.phone}
            className={fieldClass}
            {...invalid("phone")}
          />
        </OrderField>
        {message && (
          <p role="alert" className="rounded-md bg-brand-light px-3 py-2 text-center text-sm font-medium text-brand-dark">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-brand py-3.5 text-lg font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "খোঁজা হচ্ছে..." : "অর্ডারের অবস্থা দেখুন"}
        </button>
      </form>

      {order && <TrackResult order={order} whatsappNumber={whatsappNumber} />}
    </>
  );
}
