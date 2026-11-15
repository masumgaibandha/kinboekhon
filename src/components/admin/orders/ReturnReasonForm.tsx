"use client";

import type { FormEvent } from "react";

import { updateReturnReason } from "@/app/admin/(panel)/orders/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import type { ReturnReason } from "@/lib/orders/enums";
import { RETURN_REASON_LABELS } from "@/lib/orders/return-reason-labels";

export function ReturnReasonForm({ orderNumber, reason }: { orderNumber: string; reason: ReturnReason | "" }) {
  const { submit, pending, errors } = useAdminAction("return-reason");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(updateReturnReason, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="initial" value={reason} />
      <div className="min-w-48 flex-1">
        <label htmlFor="return-reason" className="block text-sm font-medium text-body">
          Reason
        </label>
        <select
          id="return-reason"
          name="reason"
          defaultValue={reason}
          className="mt-1 w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand"
        >
          <option value="">Not set</option>
          {Object.entries(RETURN_REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.reason && <p className="mt-1 text-sm text-brand-dark">{errors.reason}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save reason"}
      </button>
    </form>
  );
}
