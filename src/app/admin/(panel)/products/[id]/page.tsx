import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingLinkCard } from "@/components/admin/landing/LandingLinkCard";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { StockCard } from "@/components/admin/stock/StockCard";
import { requireAdmin } from "@/lib/admin-session";
import { categoryOptions } from "@/lib/categories/admin";
import { getLandingForAdmin } from "@/lib/landing/landing-pages";
import { getProductForAdmin } from "@/lib/products";
import { getDeliveryContext } from "@/lib/settings";
import { getProductStock } from "@/lib/stock/product-stock";

export const metadata: Metadata = { title: "Edit product" };

export const instant = false;

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [found, delivery, stock, categories, { landing }] = await Promise.all([
    getProductForAdmin(id),
    getDeliveryContext(),
    getProductStock(id),
    categoryOptions(),
    getLandingForAdmin(id),
  ]);
  if (!found || !stock) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Edit product</h1>
      <LandingLinkCard slug={found.product.slug} live={found.product.active && landing.active} editHref={`/admin/products/${id}/landing`} />
      <StockCard productId={id} stock={stock} />
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <ProductForm
        key={`${id}-${found.version}`}
        productId={id}
        product={found.product}
        categories={categories}
        costs={found.costs}
        delivery={delivery}
      />
    </div>
  );
}
