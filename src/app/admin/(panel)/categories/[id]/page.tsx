import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { requireAdmin } from "@/lib/admin-session";
import { getCategoryForAdmin } from "@/lib/categories/admin";

export const metadata: Metadata = { title: "Edit category" };

export const instant = false;

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const found = await getCategoryForAdmin(id);
  if (!found) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Edit category</h1>
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <CategoryForm key={`${id}-${found.version}`} id={id} category={found.category} />
    </div>
  );
}
