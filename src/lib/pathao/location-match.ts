import locationData from "@/data/bd-locations.json";
import { connectMongoose } from "@/lib/db";
import type { LocationData, OrderLocation } from "@/lib/locations/types";
import type { PathaoPlace } from "@/lib/models/PathaoList";
import { PathaoMatchModel } from "@/lib/models/PathaoMatch";
import { matchPlace } from "@/lib/pathao/name-match";
import { getPathaoCities, getPathaoZones } from "@/lib/pathao/places";

const data = locationData as LocationData;

// The Pathao place an order is sent to. Area is optional.
export interface CourierLocation {
  cityId: number;
  cityName: string;
  zoneId: number;
  zoneName: string;
  areaId?: number;
  areaName?: string;
}

export type MatchSource = "order" | "remembered" | "auto" | "none";

export interface LocationGuess {
  city: PathaoPlace | null;
  zone: PathaoPlace | null;
  area: PathaoPlace | null;
  citySource: MatchSource;
  zoneSource: MatchSource;
}

export const cityKey = (location: OrderLocation) => `city:${location.districtId}`;

// Only an upazila or thana is a fixed place; a Dhaka city corporation spans many Pathao zones.
export const zoneKey = (location: OrderLocation) =>
  location.kind === "outside_dhaka" && location.upazilaId ? `zone:${location.districtId}:${location.upazilaId}` : null;

function englishNames(location: OrderLocation): { district: string; upazila: string } {
  const district = data.divisions.flatMap((division) => division.districts).find((item) => item.id === location.districtId);
  const places = [...(district?.upazilas ?? []), ...(district?.cityThanas ?? [])];
  const upazila = location.upazilaId ? places.find((item) => item.id === location.upazilaId) : undefined;
  return { district: district?.en ?? "", upazila: upazila?.en ?? "" };
}

async function remembered(key: string | null): Promise<PathaoPlace | null> {
  if (!key) return null;
  const match = await PathaoMatchModel.findOne({ key }, { pathaoId: 1, name: 1 }).lean();
  return match ? { id: match.pathaoId, name: match.name } : null;
}

// The location saved on the order, else a remembered correction, else a match by English name.
export async function guessLocation(location: OrderLocation, saved?: CourierLocation): Promise<LocationGuess> {
  if (saved) {
    return {
      city: { id: saved.cityId, name: saved.cityName },
      zone: { id: saved.zoneId, name: saved.zoneName },
      area: saved.areaId && saved.areaName ? { id: saved.areaId, name: saved.areaName } : null,
      citySource: "order",
      zoneSource: "order",
    };
  }
  await connectMongoose();
  const names = englishNames(location);
  const [rememberedCity, rememberedZone] = await Promise.all([remembered(cityKey(location)), remembered(zoneKey(location))]);
  const autoCity = rememberedCity ? null : matchPlace(names.district, await getPathaoCities());
  const city = rememberedCity ?? autoCity;

  // A remembered zone is saved together with its city.
  let zone = rememberedCity ? rememberedZone : null;
  let zoneSource: MatchSource = zone ? "remembered" : "none";
  if (!zone && city && zoneKey(location)) {
    zone = matchPlace(names.upazila, await getPathaoZones(city.id));
    if (zone) zoneSource = "auto";
  }
  return {
    city,
    zone,
    area: null,
    citySource: rememberedCity ? "remembered" : autoCity ? "auto" : "none",
    zoneSource,
  };
}

// Keeps the admin's choice for later orders from the same district and upazila.
export async function rememberLocation(location: OrderLocation, chosen: CourierLocation): Promise<void> {
  const writes = [{ key: cityKey(location), pathaoId: chosen.cityId, name: chosen.cityName }];
  const zone = zoneKey(location);
  if (zone) writes.push({ key: zone, pathaoId: chosen.zoneId, name: chosen.zoneName });
  await PathaoMatchModel.bulkWrite(
    writes.map(({ key, ...match }) => ({ updateOne: { filter: { key }, update: { $set: match }, upsert: true } })),
  );
}
