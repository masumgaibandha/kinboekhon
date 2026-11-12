"use client";

import type { FormEvent } from "react";

import { reviewPayment } from "@/app/admin/(panel)/payments/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function ReviewForm({ orderNumber }: { orderNumber: string }) {
  const { submit, pending, errors } = useAdminAction(`review-${orderNumber}`);

  // The clicked button (Approve or Reject) sends its own "decision" value.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    submit(reviewPayment, new FormData(event.currentTarget, submitter));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <label htmlFor={`review-note-${orderNumber}`} className="block text-sm font-medium text-body">
        Note <span className="font-normal text-muted">(optional)</span>
      </label>
      <input
        id={`review-note-${orderNumber}`}
        name="note"
        maxLength={300}
        placeholder="For example: received in bKash statement"
        className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand ${
          errors.note ? "border-brand-dark" : "border-line-strong"
        }`}
      />
      {errors.note && <p className="text-sm text-brand-dark">{errors.note}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          name="decision"
          value="approve"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          className="rounded-lg border border-brand-dark px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
