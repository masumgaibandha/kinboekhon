import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BannerForm } from "@/components/admin/banners/BannerForm";
import { requireAdmin } from "@/lib/admin-session";
import { getBannerForAdmin } from "@/lib/banners/admin";

export const metadata: Metadata = { title: "Edit banner" };

export const instant = false;

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const found = await getBannerForAdmin(id);
  if (!found) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Edit banner</h1>
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <BannerForm key={`${id}-${found.version}`} id={id} banner={found.banner} />
    </div>
  );
}
