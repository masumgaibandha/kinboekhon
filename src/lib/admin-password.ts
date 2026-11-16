import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import { getAuth } from "@/lib/auth";

// Checks a password against the signed-in admin's login through Better Auth.
export async function adminPasswordMatches(password: string): Promise<boolean> {
  try {
    const auth = await getAuth();
    await auth.api.verifyPassword({ body: { password }, headers: await headers() });
    return true;
  } catch (error) {
    if (error instanceof APIError) return false;
    throw error;
  }
}
