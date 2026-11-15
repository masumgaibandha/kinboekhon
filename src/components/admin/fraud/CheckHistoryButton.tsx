"use client";

import { checkDeliveryHistory } from "@/app/admin/(panel)/orders/history-actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function CheckHistoryButton({ orderNumber, disabled }: { orderNumber: string; disabled: boolean }) {
  const { submit, pending } = useAdminAction("delivery-check");

  function check() {
    const formData = new FormData();
    formData.set("orderNumber", orderNumber);
    submit(checkDeliveryHistory, formData);
  }

  return (
    <button
      type="button"
      onClick={check}
      disabled={disabled || pending}
      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Checking..." : "Check delivery history"}
    </button>
  );
}
