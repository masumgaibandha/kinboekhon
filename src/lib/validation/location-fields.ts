import type { z } from "zod";

import { resolveLocation } from "@/lib/locations/resolve";
import type { LocationSelection } from "@/lib/locations/types";

export type LocationField = keyof LocationSelection;

const LOCATION_FIELDS = new Set(["divisionId", "districtId", "upazilaId"]);

// Adds location errors to a schema; `messageFor` replaces the Bangla text (the admin panel uses English).
export function addLocationIssues(
  fields: LocationSelection,
  ctx: z.RefinementCtx,
  messageFor?: (field: LocationField) => string,
) {
  const result = resolveLocation(fields);
  if (result.ok) return;
  for (const issue of result.issues) {
    ctx.addIssue({ code: "custom", path: [issue.field], message: messageFor?.(issue.field) ?? issue.message });
  }
}

// Runs the location check even when other fields are wrong, so every error shows in the same round.
export const LOCATION_CHECK = {
  when: ({ issues }: { issues: { path?: PropertyKey[] }[] }) =>
    !issues.some((issue) => LOCATION_FIELDS.has(String(issue.path?.[0]))),
};
