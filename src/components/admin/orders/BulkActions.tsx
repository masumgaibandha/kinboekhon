"use client";

import type { FormEvent } from "react";
import toast from "react-hot-toast";

import { bulkSendToPathao } from "@/app/admin/(panel)/orders/pathao-actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { PRINT_PATH } from "@/lib/orders/print-path";

const PATHAO_BUTTON = "pathao";

// The tick boxes in the orders table belong to this form through their `form` attribute.
// Print opens the ticked invoices in a new tab; Pathao sends only the ticked boxes marked `data-pathao`.
export function BulkActions({ formId, pathao }: { formId: string; pathao: boolean }) {
  const { submit, pending } = useAdminAction("pathao-bulk");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const boxes = [...form.ownerDocument.querySelectorAll<HTMLInputElement>(`input[form="${formId}"]:checked`)];
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter?.getAttribute("value") !== PATHAO_BUTTON) {
      if (boxes.length === 0) {
        event.preventDefault();
        toast.error("Tick the orders to print first.", { id: "bulk-print" });
      }
      return;
    }

    event.preventDefault();
    const sendable = boxes.filter((box) => box.dataset.pathao === "true");
    if (sendable.length === 0) {
      toast.error("Tick confirmed orders that are not sent yet.", { id: "pathao-bulk" });
      return;
    }
    const formData = new FormData();
    for (const box of sendable) formData.append("orderNumbers", box.value);
    submit(bulkSendToPathao, formData);
    for (const box of sendable) box.checked = false;
  }

  return (
    <form id={formId} action={PRINT_PATH} method="get" target="_blank" onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <button type="submit" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark">
        Print ticked invoices
      </button>
      {pathao && (
        <button
          type="submit"
          value={PATHAO_BUTTON}
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send ticked to Pathao"}
        </button>
      )}
      <span className="text-sm text-desc">
        Tick orders below.{pathao ? " Pathao gets only confirmed orders not sent yet, each once." : ""}
      </span>
    </form>
  );
}
