"use client";

import type { FormEvent } from "react";

import { updateCustomerTags } from "@/app/admin/(panel)/customers/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import { CUSTOMER_TAG_LABELS, CUSTOMER_TAGS, type CustomerTag } from "@/lib/customers/tags";

const HINTS: Record<CustomerTag, string> = {
  vip: "A good customer.",
  risky: "Call and check before confirming.",
  blocked: "New orders are still taken, marked Blocked customer and left Pending.",
};

export function CustomerTagsForm({ phone, tags }: { phone: string; tags: CustomerTag[] }) {
  const { submit, pending, errors } = useAdminAction("customer-tags");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(updateCustomerTags, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="phone" value={phone} />
      {/* The tags as loaded: only the boxes the admin toggled are written. */}
      {tags.map((tag) => (
        <input key={tag} type="hidden" name={INITIAL_VALUES_FIELD} value={tag} />
      ))}
      <fieldset className="space-y-2">
        <legend className="sr-only">Tags</legend>
        {CUSTOMER_TAGS.map((tag) => (
          <label
            key={tag}
            className="flex items-start gap-2 rounded-lg border border-line-strong px-3 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-light"
          >
            <input type="checkbox" name="tags" value={tag} defaultChecked={tags.includes(tag)} className="mt-0.5 accent-brand" />
            <span>
              <span className="block font-semibold text-heading">{CUSTOMER_TAG_LABELS[tag]}</span>
              <span className="block text-xs text-desc">{HINTS[tag]}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {errors.tags && <p className="text-sm text-brand-dark">{errors.tags}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save tags"}
      </button>
    </form>
  );
}
