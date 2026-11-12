import type { OrderLocation } from "@/lib/locations/types";

// Full place line for the admin, smallest place first. Place names stay in Bangla.
export function formatLocation(location: OrderLocation): string {
  if (location.kind === "dhaka_city") return `${location.cityCorporationName}, ${location.district}`;
  const thana = location.upazilaType === "city_thana" ? " (city thana)" : "";
  return `${location.upazila}${thana}, ${location.district}, ${location.division}`;
}

// Short label for the orders table: the city corporation inside Dhaka, upazila and district outside.
export function shortLocation(location: OrderLocation): string {
  if (location.kind === "dhaka_city") return location.cityCorporation === "dncc" ? "Dhaka North" : "Dhaka South";
  return `${location.upazila}, ${location.district}`;
}
