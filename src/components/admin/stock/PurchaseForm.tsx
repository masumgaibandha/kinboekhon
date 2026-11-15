"use client";

import { useRef, type FormEvent } from "react";

import { addPurchase } from "@/app/admin/(panel)/products/stock-actions";
import { TextField } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function PurchaseForm({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, errors } = useAdminAction("stock-purchase", () => formRef.current?.reset());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(addPurchase, new FormData(event.currentTarget));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-3">
      <h3 className="font-semibold text-heading">Purchase in</h3>
      <input type="hidden" name="productId" value={productId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField name="quantity" label="Units" defaultValue="" error={errors.quantity} numeric />
        <TextField name="unitCost" label="Cost per unit (taka)" defaultValue="" error={errors.unitCost} numeric />
      </div>
      <TextField name="note" label="Note" defaultValue="" error={errors.note} placeholder="For example: China shipment 2" />
      <button type="submit" disabled={pending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Add to stock"}
      </button>
    </form>
  );
}
