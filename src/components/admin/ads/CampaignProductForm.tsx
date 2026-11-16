"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { saveCampaignProductAction } from "@/app/admin/(panel)/ads/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

interface CampaignProductFormProps {
  campaignId: string;
  productId: string;
  products: { id: string; name: string }[];
}

export function CampaignProductForm({ campaignId, productId, products }: CampaignProductFormProps) {
  const router = useRouter();
  const { submit, pending } = useAdminAction(`campaign-product-${campaignId}`, () => router.refresh());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(saveCampaignProductAction, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input type="hidden" name="campaignId" value={campaignId} />
      <select
        name="productId"
        defaultValue={productId}
        aria-label="Campaign product"
        className="max-w-48 rounded-lg border border-line-strong bg-card px-2 py-1.5 text-sm text-body outline-none focus:border-brand"
      >
        <option value="">No product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand-dark disabled:opacity-60"
      >
        Save
      </button>
    </form>
  );
}
