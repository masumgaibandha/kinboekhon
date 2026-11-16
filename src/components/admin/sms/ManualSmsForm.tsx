"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { sendOrderSmsAction } from "@/app/admin/(panel)/orders/sms-actions";
import { inputClass } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { SmsCount } from "@/components/admin/sms/SmsCount";
import { SMS_MAX_CHARS } from "@/lib/validation/sms-settings";

export function ManualSmsForm({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const { submit, pending, errors } = useAdminAction("order-sms", () => {
    setText("");
    router.refresh();
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(sendOrderSmsAction, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <label htmlFor="manual-sms" className="block text-sm font-medium text-body">
        Send SMS
      </label>
      <textarea
        id="manual-sms"
        name="text"
        rows={3}
        maxLength={SMS_MAX_CHARS}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Bangla text to the customer, sent as typed."
        aria-invalid={errors.text ? true : undefined}
        className={`${inputClass} ${errors.text ? "border-brand-dark" : "border-line-strong"}`}
      />
      {errors.text && <p className="text-sm text-brand-dark">{errors.text}</p>}
      <SmsCount text={text.trim()} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send SMS"}
      </button>
    </form>
  );
}
