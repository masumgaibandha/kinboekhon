"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { sendTestSmsAction } from "@/app/admin/(panel)/sms/actions";
import { inputClass } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function TestSmsForm() {
  const router = useRouter();
  const { submit, pending, errors } = useAdminAction("test-sms", () => router.refresh());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(sendTestSmsAction, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2 rounded-xl border border-line bg-card p-4">
      <label htmlFor="test-sms-phone" className="block text-sm font-semibold text-heading">
        Send test SMS to my number
      </label>
      <p className="text-sm text-desc">One real SMS to check the connection. It can be sent once.</p>
      <div className="flex flex-wrap gap-2">
        <input
          id="test-sms-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="01712345678"
          aria-invalid={errors.phone ? true : undefined}
          className={`${inputClass} max-w-xs ${errors.phone ? "border-brand-dark" : "border-line-strong"}`}
        />
        <button type="submit" disabled={pending} className="mt-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Sending..." : "Send test SMS"}
        </button>
      </div>
      {errors.phone && <p className="text-sm text-brand-dark">{errors.phone}</p>}
    </form>
  );
}
