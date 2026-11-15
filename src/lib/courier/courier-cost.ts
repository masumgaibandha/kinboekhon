import type { CourierSettings } from "@/lib/validation/courier-settings";

// Pathao rates from Gaibandha, November 2026.
export const DEFAULT_COURIER_SETTINGS: CourierSettings = {
  dhakaHalfKg: 110,
  dhakaOneKg: 130,
  dhakaTwoKg: 170,
  outsideHalfKg: 120,
  outsideOneKg: 145,
  outsideTwoKg: 180,
  returnFeePercent: 50,
  codPercent: 1,
};

export function withCourierDefaults(saved?: Partial<CourierSettings>): CourierSettings {
  return { ...DEFAULT_COURIER_SETTINGS, ...saved };
}

export const MAX_SLAB_GRAMS = 2000;

// What the courier takes to deliver a parcel; above 2 kg the 2 kg rate is used.
export function courierCost(settings: CourierSettings, dhakaCity: boolean, grams: number): number {
  if (grams <= 500) return dhakaCity ? settings.dhakaHalfKg : settings.outsideHalfKg;
  if (grams <= 1000) return dhakaCity ? settings.dhakaOneKg : settings.outsideOneKg;
  return dhakaCity ? settings.dhakaTwoKg : settings.outsideTwoKg;
}

// A returned parcel pays the delivery cost plus the return fee.
export function returnedParcelCost(settings: CourierSettings, deliveryCost: number): number {
  return deliveryCost * (1 + settings.returnFeePercent / 100);
}
