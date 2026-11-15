"use client";

import type { FormEvent } from "react";

import { bulkSendToPathao } from "@/app/admin/(panel)/orders/pathao-actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

// The tick boxes in the orders table belong to this form through their `form` attribute.
export function BulkSendForm({ formId }: { formId: string }) {
  const { submit, pending } = useAdminAction("pathao-bulk");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    submit(bulkSendToPathao, new FormData(form));
    for (const box of form.ownerDocument.querySelectorAll<HTMLInputElement>(`input[form="${formId}"]`)) box.checked = false;
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <button type="submit" disabled={pending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Sending..." : "Send ticked to Pathao"}
      </button>
      <span className="text-sm text-desc">Tick confirmed orders below. Each is sent once.</span>
    </form>
  );
}
