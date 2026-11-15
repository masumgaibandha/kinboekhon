import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSpendForm } from "@/components/admin/ad-spend/AdSpendForm";
import { DeleteAdSpendButton } from "@/components/admin/ad-spend/DeleteAdSpendButton";
import { getAdSpendForAdmin, productChoices } from "@/lib/ad-spend/ad-spend-entries";
import { requireAdmin } from "@/lib/admin-session";
import { dhakaDay } from "@/lib/dates";

export const metadata: Metadata = { title: "Edit ad spend" };

export const instant = false;

export default async function EditAdSpendPage({ params }: PageProps<"/admin/ad-spend/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [found, products] = await Promise.all([getAdSpendForAdmin(id), productChoices()]);
  if (!found) notFound();
  const { entry, values, version } = found;

  return (
    <div className="space-y-5">
      <Link href="/admin/ad-spend" className="text-sm font-medium text-desc hover:text-brand">
        Back to ad spend
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Edit ad spend</h1>
        <DeleteAdSpendButton id={entry.id} redirectTo="/admin/ad-spend" />
      </div>
      <section className="rounded-xl border border-line bg-card p-5">
        {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
        <AdSpendForm
          key={version}
          products={products}
          today={dhakaDay(new Date())}
          start={{
            day: entry.day,
            productId: entry.productId,
            amountUsd: entry.amountUsd.toFixed(2),
            usdRate: String(entry.usdRate),
          }}
          edit={{ id: entry.id, initial: values }}
        />
      </section>
    </div>
  );
}
