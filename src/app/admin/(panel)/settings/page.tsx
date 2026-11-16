import type { Metadata } from "next";

import { DangerZone } from "@/components/admin/settings/DangerZone";
import { LaunchMode } from "@/components/admin/settings/LaunchMode";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { requireAdmin } from "@/lib/admin-session";
import { countTestData } from "@/lib/reset/test-data";
import { getSettingsForAdmin, isLaunchMode } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export const instant = false;

export default async function SettingsPage() {
  await requireAdmin();
  const [{ settings, saved, reviewWallets, version }, launchMode] = await Promise.all([getSettingsForAdmin(), isLaunchMode()]);
  const counts = launchMode ? null : await countTestData();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Settings</h1>
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <SettingsForm key={version} settings={settings} saved={saved} reviewWallets={reviewWallets} />
      <LaunchMode on={launchMode} />
      {counts && <DangerZone counts={counts} />}
    </div>
  );
}
