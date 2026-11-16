"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import { adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { adminPasswordMatches } from "@/lib/admin-password";
import { requireAdmin } from "@/lib/admin-session";
import { getAuth } from "@/lib/auth";
import { takeRateLimit } from "@/lib/rate-limit";
import { changeEmailSchema, changePasswordSchema } from "@/lib/validation/account";

const ACCOUNT_WINDOWS = [{ name: "10m", max: 5, windowMs: 10 * 60 * 1000 }];
const TOO_MANY = "Too many tries. Wait 10 minutes and try again.";
const WRONG_PASSWORD = "Wrong password.";

function wrongPassword(): AdminActionResult {
  return adminFail(WRONG_PASSWORD, { currentPassword: WRONG_PASSWORD });
}

export async function changeAdminEmail(formData: FormData): Promise<AdminActionResult> {
  const session = await requireAdmin();

  const parsed = changeEmailSchema.safeParse({
    newEmail: String(formData.get("newEmail") ?? ""),
    currentPassword: String(formData.get("currentPassword") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { newEmail, currentPassword } = parsed.data;
  if (newEmail === session.user.email) {
    return adminFail("This is already your login email.", { newEmail: "This is already your login email." });
  }

  try {
    if (!(await takeRateLimit("account", session.user.id, ACCOUNT_WINDOWS))) return adminFail(TOO_MANY);
    if (!(await adminPasswordMatches(currentPassword))) return wrongPassword();

    const auth = await getAuth();
    const ctx = await auth.$context;
    const owner = await ctx.internalAdapter.findUserByEmail(newEmail);
    if (owner && owner.user.id !== session.user.id) {
      return adminFail("This email is used by another user.", { newEmail: "This email is used by another user." });
    }
    // Better Auth's change-email endpoint always asks for email verification, so the one admin is updated directly.
    await ctx.internalAdapter.updateUser(session.user.id, { email: newEmail, emailVerified: true });
    await auth.api.revokeOtherSessions({ headers: await headers() });
  } catch {
    return adminFail("Could not change the email. Try again.");
  }

  return { ok: true, message: `Login email changed to ${newEmail}. Other sessions were signed out.` };
}

export async function changeAdminPassword(formData: FormData): Promise<AdminActionResult> {
  const session = await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { currentPassword, newPassword } = parsed.data;

  try {
    if (!(await takeRateLimit("account", session.user.id, ACCOUNT_WINDOWS))) return adminFail(TOO_MANY);
    const auth = await getAuth();
    const requestHeaders = await headers();
    // changePassword's own revoke swaps this session's token, so the page refresh in this request would sign out.
    await auth.api.changePassword({ body: { currentPassword, newPassword }, headers: requestHeaders });
    await auth.api.revokeOtherSessions({ headers: requestHeaders });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_PASSWORD") return wrongPassword();
    return adminFail("Could not change the password. Try again.");
  }

  return { ok: true, message: "Password changed. Other sessions were signed out." };
}
