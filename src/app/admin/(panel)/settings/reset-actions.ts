"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import { adminFail, zodFail, type AdminActionResult } from "@/lib/admin-result";
import { requireAdmin } from "@/lib/admin-session";
import { auth } from "@/lib/auth";
import { connectMongoose, DB_NAME } from "@/lib/db";
import { ResetLogModel } from "@/lib/models/ResetLog";
import { SettingsModel } from "@/lib/models/Settings";
import { takeRateLimit } from "@/lib/rate-limit";
import { countTestData, deleteTestData } from "@/lib/reset/test-data";
import { isLaunchMode, SETTINGS_KEY } from "@/lib/settings";
import { launchModeSchema, resetSchema } from "@/lib/validation/reset";

const RESET_WINDOWS = [{ name: "10m", max: 5, windowMs: 10 * 60 * 1000 }];
const LAUNCH_MODE_ON = "Launch mode is on. Test data can no longer be reset.";

async function passwordMatches(password: string): Promise<boolean> {
  try {
    await auth.api.verifyPassword({ body: { password }, headers: await headers() });
    return true;
  } catch (error) {
    if (error instanceof APIError) return false;
    throw error;
  }
}

export async function resetTestData(formData: FormData): Promise<AdminActionResult> {
  const session = await requireAdmin();

  const parsed = resetSchema.safeParse({
    confirm: String(formData.get("confirm") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return zodFail(parsed.error);

  try {
    if (await isLaunchMode()) return adminFail(LAUNCH_MODE_ON);
    if (!(await takeRateLimit("reset", session.user.id, RESET_WINDOWS))) {
      return adminFail("Too many tries. Wait 10 minutes and try again.");
    }
    if (!(await passwordMatches(parsed.data.password))) {
      return adminFail("Wrong password.", { password: "Wrong password." });
    }

    const deleted = await countTestData();
    await deleteTestData();
    await ResetLogModel.create({ adminEmail: session.user.email, dbName: DB_NAME, deleted });
  } catch {
    return adminFail("Could not reset. Try again.");
  }

  return { ok: true, message: "All test data deleted. The next order is KE10001." };
}

// One way only: nothing in the app turns launch mode off.
export async function turnOnLaunchMode(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = launchModeSchema.safeParse({ understood: formData.get("understood") === "on" });
  if (!parsed.success) return zodFail(parsed.error);

  try {
    await connectMongoose();
    await SettingsModel.updateOne({ key: SETTINGS_KEY }, { $set: { launchMode: true } }, { upsert: true });
  } catch {
    return adminFail("Could not turn on launch mode. Try again.");
  }
  return { ok: true, message: "Launch mode is on." };
}
