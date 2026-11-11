import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin-session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAdmin();

  return (
    <section className="rounded-xl border border-line bg-card p-6">
      <h1 className="text-xl font-bold text-heading">Dashboard</h1>
      <p className="mt-2 text-desc">Signed in as {session.user.email}.</p>
    </section>
  );
}
