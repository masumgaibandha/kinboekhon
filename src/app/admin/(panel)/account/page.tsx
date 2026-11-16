import type { Metadata } from "next";

import { ChangeEmailForm } from "@/components/admin/account/ChangeEmailForm";
import { ChangePasswordForm } from "@/components/admin/account/ChangePasswordForm";
import { requireAdmin } from "@/lib/admin-session";

export const metadata: Metadata = { title: "My account" };

export const instant = false;

export default async function AccountPage() {
  const { user } = await requireAdmin();
  const version = new Date(user.updatedAt).toISOString();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">My account</h1>
      {/* Keyed on the account version, so a page restored from navigation history shows fresh values. */}
      <ChangeEmailForm key={`email-${version}`} email={user.email} />
      <ChangePasswordForm key={`password-${version}`} email={user.email} />
    </div>
  );
}
