import locationData from "@/data/bd-locations.json";
import { CITY_CORPORATIONS, DHAKA_DISTRICT_ID, DHAKA_DIVISION_ID } from "@/lib/locations/dhaka";
import type { LocationData, LocationSelection, OrderLocation } from "@/lib/locations/types";

const data = locationData as LocationData;

type Field = keyof LocationSelection | "cityCorporation";

export type ResolveResult =
  | { ok: true; location: OrderLocation }
  | { ok: false; issues: { field: Field; message: string }[] };

const MISSING: Record<keyof LocationSelection, string> = {
  divisionId: "বিভাগ বেছে নিন।",
  districtId: "জেলা বেছে নিন।",
  upazilaId: "উপজেলা বা থানা বেছে নিন।",
};

const fail = (field: Field, message: string): ResolveResult => ({ ok: false, issues: [{ field, message }] });

// Inside Dhaka: only a city corporation; division and district are Dhaka.
export function resolveDhakaCity(cityCorporation: string): ResolveResult {
  const corporation = CITY_CORPORATIONS.find((item) => item.id === cityCorporation);
  if (!corporation) return fail("cityCorporation", "সিটি কর্পোরেশন বেছে নিন।");

  const division = data.divisions.find((item) => item.id === DHAKA_DIVISION_ID);
  const district = division?.districts.find((item) => item.id === DHAKA_DISTRICT_ID);
  if (!division || !district) throw new Error("Dhaka is missing from the location data");

  return {
    ok: true,
    location: {
      kind: "dhaka_city",
      cityCorporation: corporation.id,
      cityCorporationName: corporation.bn,
      divisionId: division.id,
      division: division.bn,
      districtId: district.id,
      district: district.bn,
    },
  };
}

// Outside Dhaka: the three ids must exist and belong together.
export function resolveLocation(selection: LocationSelection): ResolveResult {
  const missing = (Object.keys(MISSING) as (keyof LocationSelection)[]).filter((field) => !selection[field]);
  if (missing.length > 0) return { ok: false, issues: missing.map((field) => ({ field, message: MISSING[field] })) };

  const division = data.divisions.find((item) => item.id === selection.divisionId);
  if (!division) return fail("divisionId", MISSING.divisionId);

  const district = division.districts.find((item) => item.id === selection.districtId);
  if (!district) return fail("districtId", "এই বিভাগের একটি জেলা বেছে নিন।");

  const thana = district.cityThanas?.find((item) => item.id === selection.upazilaId);
  const upazila = thana ?? district.upazilas.find((item) => item.id === selection.upazilaId);
  if (!upazila) return fail("upazilaId", "এই জেলার একটি উপজেলা বা থানা বেছে নিন।");

  return {
    ok: true,
    location: {
      kind: "outside_dhaka",
      divisionId: division.id,
      division: division.bn,
      districtId: district.id,
      district: district.bn,
      upazilaId: upazila.id,
      upazila: upazila.bn,
      upazilaType: thana ? "city_thana" : "upazila",
    },
  };
}
