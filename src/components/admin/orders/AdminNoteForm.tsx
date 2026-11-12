"use client";

import type { FormEvent } from "react";

import { saveAdminNote } from "@/app/admin/(panel)/orders/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";

interface AdminNoteFormProps {
  orderNumber: string;
  note: string;
}

export function AdminNoteForm({ orderNumber, note }: AdminNoteFormProps) {
  const { submit, pending, errors } = useAdminAction("order-note");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(saveAdminNote, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      {/* The note as loaded: the save is refused if someone changed it meanwhile. */}
      <input type="hidden" name={INITIAL_VALUES_FIELD} value={note} />
      <label htmlFor="admin-note" className="sr-only">
        Admin note
      </label>
      <textarea
        id="admin-note"
        name="adminNote"
        rows={3}
        maxLength={2000}
        defaultValue={note}
        placeholder="Only you see this note."
        aria-invalid={errors.note ? true : undefined}
        className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand ${
          errors.note ? "border-brand-dark" : "border-line-strong"
        }`}
      />
      {errors.note && <p className="text-sm text-brand-dark">{errors.note}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save note"}
      </button>
    </form>
  );
}
