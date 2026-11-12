import type { z } from "zod";

export type AdminActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

export const FIX_FIELDS = "Please fix the highlighted fields.";
export const TRY_AGAIN = "Could not save. Try again.";

export function adminFail(message: string, fieldErrors: Record<string, string> = {}): AdminActionResult {
  return { ok: false, message, fieldErrors };
}

// First message per field, keyed by its dot path.
export function zodFail(error: z.ZodError): AdminActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
  return adminFail(FIX_FIELDS, fieldErrors);
}
