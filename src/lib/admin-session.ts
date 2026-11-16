import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "@/lib/auth";

export const getAdminSession = cache(async () => {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

// For admin Route Handlers: returns a 401 response to send back, or null when the admin is signed in.
export async function requireAdminApi(): Promise<Response | null> {
  const session = await getAdminSession();
  return session ? null : Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
}
