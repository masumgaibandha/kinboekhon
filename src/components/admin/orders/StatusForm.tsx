"use client";

import type { FormEvent } from "react";

import { updateOrderStatus } from "@/app/admin/(panel)/orders/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import type { OrderStatus } from "@/lib/orders/enums";
import { STATUS_LABELS, STATUS_MOVES } from "@/lib/orders/status";

interface StatusFormProps {
  orderNumber: string;
  status: OrderStatus;
  // A payment waiting for review: the order is confirmed by approving it, not here.
  paymentWaiting: boolean;
}

const fieldClass =
  "mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand";

export function StatusForm({ orderNumber, status, paymentWaiting }: StatusFormProps) {
  const { submit, pending, errors } = useAdminAction("order-status");
  const moves = STATUS_MOVES[status].filter((move) => !(paymentWaiting && move === "confirmed"));

  if (STATUS_MOVES[status].length === 0) {
    return <p className="text-sm text-desc">This order is {STATUS_LABELS[status].toLowerCase()}. Its status is final.</p>;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(updateOrderStatus, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="from" value={status} />
      {paymentWaiting && (
        <p className="rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">
          An advance payment is waiting for review. Approving it confirms the order.
        </p>
      )}
      <div>
        <label htmlFor="status-to" className="block text-sm font-medium text-body">
          New status
        </label>
        <select
          id="status-to"
          name="to"
          defaultValue={moves[0]}
          aria-invalid={errors.to ? true : undefined}
          className={`${fieldClass} ${errors.to ? "border-brand-dark" : "border-line-strong"}`}
        >
          {moves.map((move) => (
            <option key={move} value={move}>
              {STATUS_LABELS[move]}
            </option>
          ))}
        </select>
        {errors.to && <p className="mt-1 text-sm text-brand-dark">{errors.to}</p>}
      </div>
      <div>
        <label htmlFor="status-note" className="block text-sm font-medium text-body">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="status-note"
          name="note"
          maxLength={300}
          placeholder="For example: confirmed on the phone"
          className={`${fieldClass} ${errors.note ? "border-brand-dark" : "border-line-strong"}`}
        />
        {errors.note && <p className="mt-1 text-sm text-brand-dark">{errors.note}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Change status"}
      </button>
    </form>
  );
}
