import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { requireAdmin } from "@/lib/admin-session";
import { categoryOptions } from "@/lib/categories/admin";
import { EMPTY_PRODUCT, startingCosts } from "@/lib/products";
import { getCostDefaults, getDeliveryContext } from "@/lib/settings";

export const metadata: Metadata = { title: "Add product" };

export const instant = false;

export default async function NewProductPage() {
  await requireAdmin();
  const [defaults, delivery, categories] = await Promise.all([getCostDefaults(), getDeliveryContext(), categoryOptions()]);
  const costs = startingCosts(defaults);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Add product</h1>
      <ProductForm product={EMPTY_PRODUCT} categories={categories} costs={costs} delivery={delivery} />
    </div>
  );
}
