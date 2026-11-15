"use client";

import type { FormEvent } from "react";

import { saveManualDeliveryHistory } from "@/app/admin/(panel)/orders/history-actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

const fieldClass = "mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand";

interface FieldProps {
  name: string;
  label: string;
  error?: string;
  numeric?: boolean;
  placeholder?: string;
  maxLength: number;
}

function Field({ name, label, error, numeric, placeholder, maxLength }: FieldProps) {
  return (
    <div>
      <label htmlFor={`manual-${name}`} className="block text-sm font-medium text-body">
        {label}
      </label>
      <input
        id={`manual-${name}`}
        name={name}
        inputMode={numeric ? "numeric" : undefined}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`${fieldClass} ${error ? "border-brand-dark" : "border-line-strong"}`}
      />
      {error && <p className="mt-1 text-sm text-brand-dark">{error}</p>}
    </div>
  );
}

// Counts or a Pathao rating typed from another courier's panel. Replaces the earlier manual entry.
export function ManualHistoryForm({ orderNumber }: { orderNumber: string }) {
  const { submit, pending, errors } = useAdminAction("manual-history");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(saveManualDeliveryHistory, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <div className="grid grid-cols-2 gap-3">
        <Field name="delivered" label="Delivered" error={errors.delivered} numeric maxLength={4} />
        <Field name="failed" label="Cancelled / returned" error={errors.failed} numeric maxLength={4} />
      </div>
      <Field name="pathaoRating" label="Pathao rating (optional)" error={errors.pathaoRating} maxLength={40} placeholder="As shown by Pathao" />
      <Field name="note" label="Note (optional)" error={errors.note} maxLength={300} placeholder="For example: from the Pathao merchant panel" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save manual entry"}
      </button>
    </form>
  );
}
