import locationData from "@/data/bd-locations.json";
import { cityGroupOf } from "@/lib/locations/dhaka";
import type { LocationData, LocationSelection } from "@/lib/locations/types";

const data = locationData as LocationData;

// As much of the place as the customer chose, smallest first; "" when nothing was chosen.
export function draftPlace({ divisionId, districtId, upazilaId }: LocationSelection): string {
  const division = data.divisions.find((item) => item.id === divisionId);
  const district = division?.districts.find((item) => item.id === districtId);
  const places = district ? [...(cityGroupOf(district)?.places ?? []), ...district.upazilas] : [];
  const upazila = places.find((item) => item.id === upazilaId);
  return [upazila?.bn, district?.bn, division?.bn].filter(Boolean).join(", ");
}
