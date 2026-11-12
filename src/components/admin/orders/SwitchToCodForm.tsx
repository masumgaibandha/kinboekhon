"use client";

import type { FormEvent } from "react";

import { switchOrderToCod } from "@/app/admin/(panel)/orders/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { Money } from "@/components/ui/Money";

interface SwitchToCodFormProps {
  orderNumber: string;
  // The total after the switch: the full delivery charge, no advance discount.
  newTotal: number;
}

export function SwitchToCodForm({ orderNumber, newTotal }: SwitchToCodFormProps) {
  const { submit, pending, errors } = useAdminAction("order-switch-cod");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(switchOrderToCod, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2 rounded-lg bg-brand-light p-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <p className="text-sm text-body">
        The payment was rejected. After talking to the customer you can switch this order to cash on delivery. The new
        total is <Money amount={newTotal} bold />, all collected on delivery.
      </p>
      <input
        name="note"
        maxLength={300}
        aria-label="Note for the switch"
        placeholder="Note (optional)"
        className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand ${
          errors.note ? "border-brand-dark" : "border-line-strong"
        }`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Switch to cash on delivery"}
      </button>
    </form>
  );
}
