import type { LocationDistrict, Place } from "@/lib/locations/types";

// In Dhaka district the customer can pick a city corporation instead of an upazila; the order saves it for the courier.
export const CITY_CORPORATIONS = [
  { id: "dncc", bn: "ঢাকা উত্তর সিটি কর্পোরেশন", en: "Dhaka North City Corporation" },
  { id: "dscc", bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন", en: "Dhaka South City Corporation" },
] as const;

// Well-known areas of each city corporation, shown under the list when the district is Dhaka.
export const CITY_CORPORATION_HINT =
  "উত্তর সিটি: উত্তরা, মিরপুর, গুলশান, বনানী, বাড্ডা, মোহাম্মদপুর। দক্ষিণ সিটি: ধানমন্ডি, মতিঝিল, পুরান ঢাকা, যাত্রাবাড়ী, লালবাগ, খিলগাঁও।";

export type CityCorporationId = (typeof CITY_CORPORATIONS)[number]["id"];

export const DHAKA_DISTRICT_ID = "47";

export function cityCorporationOf(id: string) {
  return CITY_CORPORATIONS.find((item) => item.id === id);
}

export interface CityGroup {
  kind: "city_corporation" | "city_thana";
  places: readonly Place[];
}

// The city choices listed before a district's upazilas: Dhaka's city corporations or Chattogram's city thanas.
export function cityGroupOf(district: LocationDistrict): CityGroup | null {
  if (district.id === DHAKA_DISTRICT_ID) return { kind: "city_corporation", places: CITY_CORPORATIONS };
  return district.cityThanas ? { kind: "city_thana", places: district.cityThanas } : null;
}
