import type { CityCorporationId } from "@/lib/locations/dhaka";

export interface Place {
  id: string;
  bn: string;
  en: string;
}

export interface LocationDistrict extends Place {
  cityLabel?: string;
  cityThanas?: Place[];
  upazilas: Place[];
}

export interface LocationDivision extends Place {
  districts: LocationDistrict[];
}

export interface LocationData {
  divisions: LocationDivision[];
}

export interface LocationSelection {
  divisionId: string;
  districtId: string;
  upazilaId: string;
}

export const EMPTY_LOCATION: LocationSelection = { divisionId: "", districtId: "", upazilaId: "" };

// What an order stores: division and district, then a Dhaka city corporation or an upazila / city thana.
export interface OrderLocation {
  kind: "dhaka_city" | "outside_dhaka";
  cityCorporation?: CityCorporationId;
  cityCorporationName?: string;
  divisionId: string;
  division: string;
  districtId: string;
  district: string;
  upazilaId?: string;
  upazila?: string;
  upazilaType?: "upazila" | "city_thana";
}
