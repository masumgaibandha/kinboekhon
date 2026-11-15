"use client";

import type { FormEvent } from "react";

import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import type { AdminActionResult } from "@/lib/admin-result";

interface PathaoActionButtonProps {
  orderNumber: string;
  action: (formData: FormData) => Promise<AdminActionResult>;
  label: string;
  pendingLabel: string;
  toastId: string;
  secondary?: boolean;
}

// One button that runs a Pathao action for the order.
export function PathaoActionButton({ orderNumber, action, label, pendingLabel, toastId, secondary }: PathaoActionButtonProps) {
  const { submit, pending } = useAdminAction(toastId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(action, new FormData(event.currentTarget));
  }

  const look = secondary ? "border border-line-strong bg-card text-body hover:border-brand" : "bg-brand text-white";
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <button type="submit" disabled={pending} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${look}`}>
        {pending ? pendingLabel : label}
      </button>
    </form>
  );
}
