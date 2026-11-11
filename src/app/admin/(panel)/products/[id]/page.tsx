import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { requireAdmin } from "@/lib/admin-session";
import { getProductForAdmin } from "@/lib/products";

export const metadata: Metadata = { title: "Edit product" };

export const instant = false;

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const found = await getProductForAdmin(id);
  if (!found) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Edit product</h1>
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <ProductForm key={`${id}-${found.version}`} productId={id} product={found.product} />
    </div>
  );
}
