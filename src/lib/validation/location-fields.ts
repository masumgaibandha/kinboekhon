import type { z } from "zod";

import { resolveDhakaCity, resolveLocation, type ResolveResult } from "@/lib/locations/resolve";
import type { LocationSelection } from "@/lib/locations/types";
import type { DeliveryArea } from "@/lib/orders/limits";

export interface AreaLocationFields extends LocationSelection {
  deliveryArea: DeliveryArea;
  cityCorporation: string;
}

export type LocationField = "cityCorporation" | keyof LocationSelection;

const LOCATION_FIELDS = new Set(["deliveryArea", "cityCorporation", "divisionId", "districtId", "upazilaId"]);

// Inside Dhaka needs a city corporation; outside needs a division, district and upazila that belong together.
export function resolveAreaLocation({ deliveryArea, cityCorporation, divisionId, districtId, upazilaId }: AreaLocationFields): ResolveResult {
  return deliveryArea === "inside_dhaka"
    ? resolveDhakaCity(cityCorporation)
    : resolveLocation({ divisionId, districtId, upazilaId });
}

// Adds location errors to a schema; `messageFor` replaces the Bangla text (the admin panel uses English).
export function addLocationIssues(
  fields: AreaLocationFields,
  ctx: z.RefinementCtx,
  messageFor?: (field: LocationField) => string,
) {
  const result = resolveAreaLocation(fields);
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
