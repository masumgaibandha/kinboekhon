import locationData from "@/data/bd-locations.json";
import { DHAKA_DISTRICT_ID, cityCorporationOf } from "@/lib/locations/dhaka";
import type { LocationData, LocationSelection, OrderLocation } from "@/lib/locations/types";

const data = locationData as LocationData;

type Field = keyof LocationSelection;

export type ResolveResult =
  | { ok: true; location: OrderLocation }
  | { ok: false; issues: { field: Field; message: string }[] };

const MISSING: Record<Field, string> = {
  divisionId: "বিভাগ বেছে নিন।",
  districtId: "জেলা বেছে নিন।",
  upazilaId: "উপজেলা বা থানা বেছে নিন।",
};

const fail = (field: Field, message: string): ResolveResult => ({ ok: false, issues: [{ field, message }] });

// The three ids must exist and belong together; in Dhaka district the third may be a city corporation.
export function resolveLocation(selection: LocationSelection): ResolveResult {
  const missing = (Object.keys(MISSING) as Field[]).filter((field) => !selection[field]);
  if (missing.length > 0) return { ok: false, issues: missing.map((field) => ({ field, message: MISSING[field] })) };

  const division = data.divisions.find((item) => item.id === selection.divisionId);
  if (!division) return fail("divisionId", MISSING.divisionId);

  const district = division.districts.find((item) => item.id === selection.districtId);
  if (!district) return fail("districtId", "এই বিভাগের একটি জেলা বেছে নিন।");
  const place = { divisionId: division.id, division: division.bn, districtId: district.id, district: district.bn };

  const corporation = district.id === DHAKA_DISTRICT_ID ? cityCorporationOf(selection.upazilaId) : undefined;
  if (corporation) {
    return {
      ok: true,
      location: { kind: "dhaka_city", cityCorporation: corporation.id, cityCorporationName: corporation.bn, ...place },
    };
  }

  const thana = district.cityThanas?.find((item) => item.id === selection.upazilaId);
  const upazila = thana ?? district.upazilas.find((item) => item.id === selection.upazilaId);
  if (!upazila) return fail("upazilaId", "এই জেলার একটি উপজেলা বা থানা বেছে নিন।");

  return {
    ok: true,
    location: {
      kind: "outside_dhaka",
      ...place,
      upazilaId: upazila.id,
      upazila: upazila.bn,
      upazilaType: thana ? "city_thana" : "upazila",
    },
  };
}
