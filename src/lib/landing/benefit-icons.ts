// Icons the admin can pick for each benefit on an ad landing page, with their admin labels.
export const BENEFIT_ICONS = {
  check: "Check",
  shield: "Shield (quality, safety)",
  bolt: "Bolt (fast, power)",
  clock: "Clock (saves time)",
  star: "Star (premium)",
  heart: "Heart (family, care)",
  leaf: "Leaf (natural, eco)",
  hand: "Hand (easy to use)",
  gift: "Gift",
  truck: "Truck (delivery)",
} as const;

export type BenefitIcon = keyof typeof BENEFIT_ICONS;

export const BENEFIT_ICON_KEYS = Object.keys(BENEFIT_ICONS) as [BenefitIcon, ...BenefitIcon[]];

export const MAX_BENEFITS = 10;
