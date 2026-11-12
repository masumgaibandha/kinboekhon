"use client";

import { deleteIncompleteOrder, markDraftContacted } from "@/app/admin/(panel)/incomplete/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

interface DraftActionsProps {
  id: string;
  phone: string;
  contacted: boolean;
}

export function DraftActions({ id, phone, contacted }: DraftActionsProps) {
  const { submit, pending } = useAdminAction(`draft-${id}`);

  function run(action: typeof markDraftContacted) {
    const formData = new FormData();
    formData.set("id", id);
    submit(action, formData);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a href={`tel:${phone}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
        Call
      </a>
      {!contacted && (
        <button
          type="button"
          onClick={() => run(markDraftContacted)}
          disabled={pending}
          className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-60"
        >
          Mark contacted
        </button>
      )}
      <button
        type="button"
        onClick={() => run(deleteIncompleteOrder)}
        disabled={pending}
        className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-desc disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
