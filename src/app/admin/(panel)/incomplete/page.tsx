import type { Metadata } from "next";

import { DraftCard } from "@/components/admin/incomplete/DraftCard";
import { requireAdmin } from "@/lib/admin-session";
import { listDraftsForAdmin } from "@/lib/drafts/admin-draft-list";

export const metadata: Metadata = { title: "Incomplete orders" };

export const instant = false;

export default async function IncompletePage() {
  await requireAdmin();
  const { items, total } = await listDraftsForAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-heading">Incomplete orders</h1>
        <p className="text-sm text-desc">
          {total > items.length ? `Newest ${items.length} of ${total}` : `${total} ${total === 1 ? "draft" : "drafts"}`}
        </p>
      </div>
      <p className="text-sm text-desc">
        Customers who typed a valid phone but did not place the order. Each one is removed when the order is placed, or 30
        days after the customer last typed.
      </p>
      {items.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">No incomplete orders.</p>
      ) : (
        items.map((draft) => <DraftCard key={draft.id} draft={draft} />)
      )}
    </div>
  );
}
