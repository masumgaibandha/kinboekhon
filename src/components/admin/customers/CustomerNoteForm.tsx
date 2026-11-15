"use client";

import { useRef, type FormEvent } from "react";

import { saveCustomerNote } from "@/app/admin/(panel)/customers/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function CustomerNoteForm({ phone }: { phone: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, errors } = useAdminAction("customer-note", () => formRef.current?.reset());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(saveCustomerNote, new FormData(event.currentTarget));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="phone" value={phone} />
      <label htmlFor="customer-note" className="sr-only">
        New note
      </label>
      <textarea
        id="customer-note"
        name="text"
        rows={2}
        maxLength={500}
        placeholder="For example: asked for delivery after 5 pm"
        aria-invalid={errors.text ? true : undefined}
        className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand ${
          errors.text ? "border-brand-dark" : "border-line-strong"
        }`}
      />
      {errors.text && <p className="text-sm text-brand-dark">{errors.text}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add note"}
      </button>
    </form>
  );
}
