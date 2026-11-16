"use client";

import { useRouter } from "next/navigation";

import { syncMetaAdsAction } from "@/app/admin/(panel)/ads/actions";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function SyncNowButton() {
  const router = useRouter();
  const { submit, pending } = useAdminAction("meta-ads-sync", () => router.refresh());

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => submit(() => syncMetaAdsAction(), new FormData())}
      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Syncing..." : "Sync now"}
    </button>
  );
}
