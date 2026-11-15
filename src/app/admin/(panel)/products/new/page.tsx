import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { requireAdmin } from "@/lib/admin-session";
import { EMPTY_PRODUCT, startingCosts } from "@/lib/products";
import { getCostDefaults, getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Add product" };

export const instant = false;

export default async function NewProductPage() {
  await requireAdmin();
  const [defaults, settings] = await Promise.all([getCostDefaults(), getSettings()]);
  const costs = startingCosts(defaults);
  const charges = { dhakaCity: settings.deliveryChargeDhakaCity, outside: settings.deliveryChargeOutside };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Add product</h1>
      <ProductForm product={EMPTY_PRODUCT} costs={costs} charges={charges} />
    </div>
  );
}
