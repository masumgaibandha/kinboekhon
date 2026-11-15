import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LandingLinkCard } from "@/components/admin/landing/LandingLinkCard";
import { LandingPageForm } from "@/components/admin/landing/LandingPageForm";
import { requireAdmin } from "@/lib/admin-session";
import { getLandingForAdmin } from "@/lib/landing/landing-pages";
import { getProductForAdmin } from "@/lib/products";

export const metadata: Metadata = { title: "Landing page" };

export const instant = false;

export default async function ProductLandingPage({ params }: PageProps<"/admin/products/[id]/landing">) {
  await requireAdmin();
  const { id } = await params;
  const [found, { landing, version }] = await Promise.all([getProductForAdmin(id), getLandingForAdmin(id)]);
  if (!found) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/admin/products/${id}`} className="text-sm font-medium text-brand hover:underline">
          &larr; {found.product.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-heading">Landing page</h1>
      </div>
      <LandingLinkCard slug={found.product.slug} live={found.product.active && landing.active} />
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <LandingPageForm key={`${id}-${version}`} productId={id} landing={landing} />
    </div>
  );
}
