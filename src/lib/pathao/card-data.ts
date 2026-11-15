import type { AdminOrder } from "@/lib/orders/admin-order-detail";
import { pathaoConfig } from "@/lib/pathao/config";
import { guessLocation, type LocationGuess } from "@/lib/pathao/location-match";
import { amountToCollect, parcelWeightKg } from "@/lib/pathao/parcel";
import { parcelGrams } from "@/lib/pathao/parcel-weight";
import { getPathaoAreas, getPathaoCities, getPathaoZones, type PathaoPlace } from "@/lib/pathao/places";

export interface PathaoFormData {
  guess: LocationGuess;
  cities: PathaoPlace[];
  zones: PathaoPlace[];
  areas: PathaoPlace[];
  weightKg: number;
  amountToCollect: number;
}

// What the order page needs to pick the Pathao place and send an order not sent yet; null when Pathao is not set up.
export async function getPathaoFormData(order: AdminOrder): Promise<PathaoFormData | null> {
  if (!pathaoConfig()) return null;
  const [guess, cities, grams] = await Promise.all([
    guessLocation(order.customer.location, order.courierLocation ?? undefined),
    getPathaoCities(),
    parcelGrams(order.items),
  ]);
  const [zones, areas] = await Promise.all([
    guess.city ? getPathaoZones(guess.city.id) : [],
    guess.zone ? getPathaoAreas(guess.zone.id) : [],
  ]);
  return {
    guess,
    cities,
    zones,
    areas,
    weightKg: parcelWeightKg(grams),
    amountToCollect: amountToCollect(order),
  };
}
