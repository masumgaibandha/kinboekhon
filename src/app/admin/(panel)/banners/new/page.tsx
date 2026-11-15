import type { Metadata } from "next";

import { BannerForm } from "@/components/admin/banners/BannerForm";
import { requireAdmin } from "@/lib/admin-session";

export const metadata: Metadata = { title: "Add banner" };

export const instant = false;

export default async function NewBannerPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Add banner</h1>
      <BannerForm banner={{ title: "", link: "", mobileImage: null, desktopImage: null, sortOrder: 0, active: true }} />
    </div>
  );
}
