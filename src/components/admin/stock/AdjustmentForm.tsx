"use client";

import { useRef, type FormEvent } from "react";

import { addAdjustment } from "@/app/admin/(panel)/products/stock-actions";
import { TextField } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function AdjustmentForm({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, errors } = useAdminAction("stock-adjust", () => formRef.current?.reset());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(addAdjustment, new FormData(event.currentTarget));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-3">
      <h3 className="font-semibold text-heading">Manual adjustment</h3>
      <input type="hidden" name="productId" value={productId} />
      <TextField
        name="change"
        label="Change (units)"
        defaultValue=""
        error={errors.change}
        hint="Minus to take out, like -2. Plus or no sign to add."
        placeholder="-2"
      />
      <TextField name="reason" label="Reason" defaultValue="" error={errors.reason} placeholder="For example: counted 2 broken in the store" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Adjust stock"}
      </button>
    </form>
  );
}
