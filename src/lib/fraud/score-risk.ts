import type { CourierScore } from "@/lib/fraud/providers/types";
import type { RiskLabel } from "@/lib/fraud/risk";

// Steadfast score thresholds, in one place to tune. "check" is the middle (Medium) label.
export const STEADFAST_RISK = {
  // A delivery ratio under this percent is High.
  highBelowDeliveryRatio: 60,
  // At least this percent with no reports is Low; between the two is Medium.
  lowFromDeliveryRatio: 80,
  // This many fraud reports or more is High; at least mediumFromReports is Medium.
  highFromReports: 2,
  mediumFromReports: 1,
  // Fewer parcels than this (from the volume range), or the lowest band, caps the label at Medium.
  lowVolumeUnderParcels: 5,
  // Known volume bands, lowest first. An unknown band with no readable range counts as low volume.
  volumeBands: ["low", "medium", "high"],
};

export type SteadfastRiskConfig = typeof STEADFAST_RISK;

// "25+" is 25 and up, "5-9" is 5 to 9, "0" is none. Null when it cannot be read.
export function parseVolumeRange(range: string): { min: number; max: number } | null {
  const text = range.trim();
  const plus = /^(\d+)\s*\+$/.exec(text);
  if (plus) return { min: Number(plus[1]), max: Infinity };
  const span = /^(\d+)\s*-\s*(\d+)$/.exec(text);
  if (span) return { min: Number(span[1]), max: Number(span[2]) };
  return /^\d+$/.test(text) ? { min: Number(text), max: Number(text) } : null;
}

// No parcels at Steadfast: a range of 0, or no delivered and no cancelled share.
export function isNewCustomer(score: CourierScore): boolean {
  const range = parseVolumeRange(score.volumeRange);
  if (range) return range.max === 0;
  return !score.deliveryRatio && !score.cancellationRatio;
}

export function isLowVolume(score: CourierScore, config: SteadfastRiskConfig = STEADFAST_RISK): boolean {
  const band = score.volumeBand.trim().toLowerCase();
  if (band === config.volumeBands[0]) return true;
  const range = parseVolumeRange(score.volumeRange);
  if (range) return range.min < config.lowVolumeUnderParcels;
  return !config.volumeBands.includes(band);
}

export function steadfastLabel(score: CourierScore, config: SteadfastRiskConfig = STEADFAST_RISK): RiskLabel {
  const ratio = score.deliveryRatio;
  const reported = score.totalReports > 0 || score.doubtfulReports;
  if (isNewCustomer(score) && !reported) return "unknown";

  let label: RiskLabel = "unknown";
  if ((ratio !== null && ratio < config.highBelowDeliveryRatio) || score.totalReports >= config.highFromReports || score.doubtfulReports) {
    label = "high";
  } else if ((ratio !== null && ratio < config.lowFromDeliveryRatio) || score.totalReports >= config.mediumFromReports) {
    label = "check";
  } else if (ratio !== null) {
    label = "low";
  }
  return label === "high" && isLowVolume(score, config) ? "check" : label;
}
