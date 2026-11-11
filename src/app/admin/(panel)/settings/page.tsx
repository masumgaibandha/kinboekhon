import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { requireAdmin } from "@/lib/admin-session";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export const instant = false;

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
