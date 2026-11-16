"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-session";
import { getAuth } from "@/lib/auth";

export async function logout() {
  await requireAdmin();
  const auth = await getAuth();
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
