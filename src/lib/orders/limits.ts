export const MAX_QUANTITY = 5;

export const DELIVERY_AREAS = ["inside_dhaka", "outside_dhaka"] as const;

export type DeliveryArea = (typeof DELIVERY_AREAS)[number];

export const DELIVERY_AREA_LABELS: Record<DeliveryArea, string> = {
  inside_dhaka: "ঢাকার ভিতরে",
  outside_dhaka: "ঢাকার বাইরে",
};
