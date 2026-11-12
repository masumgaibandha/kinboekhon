import locationData from "@/data/bd-locations.json";
import { CITY_CORPORATIONS } from "@/lib/locations/dhaka";
import type { LocationData } from "@/lib/locations/types";
import type { DeliveryArea } from "@/lib/orders/limits";

const data = locationData as LocationData;

interface DraftPlaceFields {
  deliveryArea: DeliveryArea;
  cityCorporation: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
}

// As much of the place as the customer chose, smallest first; "" when nothing was chosen.
export function draftPlace({ deliveryArea, cityCorporation, divisionId, districtId, upazilaId }: DraftPlaceFields): string {
  if (deliveryArea === "inside_dhaka") return CITY_CORPORATIONS.find((item) => item.id === cityCorporation)?.bn ?? "";

  const division = data.divisions.find((item) => item.id === divisionId);
  const district = division?.districts.find((item) => item.id === districtId);
  const upazila = [...(district?.cityThanas ?? []), ...(district?.upazilas ?? [])].find((item) => item.id === upazilaId);
  return [upazila?.bn, district?.bn, division?.bn].filter(Boolean).join(", ");
}
