import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { requireAdmin } from "@/lib/admin-session";
import { getSettingsForAdmin } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export const instant = false;

export default async function SettingsPage() {
  await requireAdmin();
  const { settings, version } = await getSettingsForAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Settings</h1>
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <SettingsForm key={version} settings={settings} />
    </div>
  );
}
