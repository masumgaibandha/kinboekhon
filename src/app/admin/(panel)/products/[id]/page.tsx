import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { StockCard } from "@/components/admin/stock/StockCard";
import { requireAdmin } from "@/lib/admin-session";
import { getProductForAdmin } from "@/lib/products";
import { getDeliveryContext } from "@/lib/settings";
import { getProductStock } from "@/lib/stock/product-stock";

export const metadata: Metadata = { title: "Edit product" };

export const instant = false;

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [found, delivery, stock] = await Promise.all([getProductForAdmin(id), getDeliveryContext(), getProductStock(id)]);
  if (!found || !stock) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Edit product</h1>
      <StockCard productId={id} stock={stock} />
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <ProductForm key={`${id}-${found.version}`} productId={id} product={found.product} costs={found.costs} delivery={delivery} />
    </div>
  );
}
