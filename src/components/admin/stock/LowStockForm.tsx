"use client";

import type { FormEvent } from "react";

import { updateLowStockLevel } from "@/app/admin/(panel)/products/stock-actions";
import { TextField } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function LowStockForm({ productId, level }: { productId: string; level: number }) {
  const { submit, pending, errors } = useAdminAction("stock-level");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(updateLowStockLevel, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-start gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="initial" value={level} />
      <TextField
        name="level"
        label="Low-stock alert at"
        defaultValue={String(level)}
        error={errors.level}
        hint="The dashboard lists the product when stock is this or less."
        numeric
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save level"}
      </button>
    </form>
  );
}
