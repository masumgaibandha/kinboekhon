"use client";

import { useRouter } from "next/navigation";

import { deleteAdSpend } from "@/app/admin/(panel)/ad-spend/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

// `redirectTo` leaves a page that only showed this entry.
export function DeleteAdSpendButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();
  const { submit, pending } = useAdminAction(`ad-spend-${id}`, () => {
    if (redirectTo) router.push(redirectTo);
  });

  function handleClick() {
    const formData = new FormData();
    formData.set("id", id);
    submit(deleteAdSpend, formData);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-desc disabled:opacity-60"
    >
      Delete
    </button>
  );
}
