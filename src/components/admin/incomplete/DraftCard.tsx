import type { ReactNode } from "react";

import { DraftActions } from "@/components/admin/incomplete/DraftActions";
import { formatDhakaDateTime } from "@/lib/dates";
import type { AdminDraft } from "@/lib/drafts/admin-draft-list";
import { OPTION_LABELS } from "@/lib/orders/payment-methods";

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="text-sm text-body">{children || <span className="text-muted">Not filled</span>}</dd>
    </div>
  );
}

export function DraftCard({ draft }: { draft: AdminDraft }) {
  const callback = draft.kind === "callback";

  return (
    <article className={`rounded-xl border bg-card p-5 ${callback ? "border-brand" : "border-line"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <a href={`tel:${draft.phone}`} className="text-lg font-bold text-heading hover:text-brand">
          {draft.phone}
        </a>
        {callback && (
          <span className="inline-block rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">Callback request</span>
        )}
        {draft.contactedAt && (
          <span className="inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
            Contacted {formatDhakaDateTime(draft.contactedAt)}
          </span>
        )}
        <span className="text-sm text-muted">
          {callback ? "Requested" : "Last typed"} {formatDhakaDateTime(draft.updatedAt)}
        </span>
      </div>

      {callback ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Item label="Product">{draft.productName}</Item>
        </dl>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Item label="Name">{draft.name}</Item>
          <Item label="Product">
            {draft.productName} x {draft.quantity}
          </Item>
          <Item label="Payment">{draft.paymentOption && OPTION_LABELS[draft.paymentOption]}</Item>
          <Item label="Area">{draft.place}</Item>
          <Item label="Address">{draft.address}</Item>
        </dl>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <DraftActions id={draft.id} phone={draft.phone} contacted={draft.contactedAt !== null} />
      </div>
    </article>
  );
}
