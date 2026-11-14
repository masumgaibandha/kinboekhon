"use client";

import type { FormEvent } from "react";

import { logCall } from "@/app/admin/(panel)/orders/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";

const fieldClass =
  "mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand";

export function CallOutcomeForm({ orderNumber }: { orderNumber: string }) {
  const { submit, pending, errors } = useAdminAction("order-call");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(logCall, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <fieldset>
        <legend className="text-sm font-medium text-body">Outcome</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {Object.entries(CALL_OUTCOME_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-sm text-body has-[:checked]:border-brand has-[:checked]:bg-brand-light"
            >
              <input type="radio" name="outcome" value={value} className="accent-brand" />
              {label}
            </label>
          ))}
        </div>
        {errors.outcome && <p className="mt-1 text-sm text-brand-dark">{errors.outcome}</p>}
      </fieldset>
      <div>
        <label htmlFor="call-note" className="block text-sm font-medium text-body">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="call-note"
          name="note"
          maxLength={300}
          placeholder="For example: busy, call after 6 pm"
          className={`${fieldClass} ${errors.note ? "border-brand-dark" : "border-line-strong"}`}
        />
        {errors.note && <p className="mt-1 text-sm text-brand-dark">{errors.note}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save call"}
      </button>
    </form>
  );
}
