import assert from "node:assert/strict";
import { test } from "node:test";

import type { CourierScore } from "@/lib/fraud/providers/types";
import { isLowVolume, parseVolumeRange, steadfastLabel } from "@/lib/fraud/score-risk";

const score = (change: Partial<CourierScore> = {}): CourierScore => ({
  deliveryRatio: 100,
  cancellationRatio: 0,
  volumeBand: "high",
  volumeRange: "25+",
  totalReports: 0,
  doubtfulReports: false,
  score: null,
  level: "",
  ...change,
});

test("the live answer (100%, 25+, no reports) is Low", () => {
  assert.equal(steadfastLabel(score()), "low");
});

test("no parcels is Unknown (new customer)", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 0, cancellationRatio: 0, volumeBand: "none", volumeRange: "0" })), "unknown");
  assert.equal(steadfastLabel(score({ deliveryRatio: null, cancellationRatio: null, volumeBand: "", volumeRange: "" })), "unknown");
});

test("High: delivery ratio under 60", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 59, cancellationRatio: 41 })), "high");
  assert.equal(steadfastLabel(score({ deliveryRatio: 0, cancellationRatio: 100 })), "high");
});

test("High: 2 or more reports", () => {
  assert.equal(steadfastLabel(score({ totalReports: 2 })), "high");
});

test("High: doubtful reports", () => {
  assert.equal(steadfastLabel(score({ doubtfulReports: true })), "high");
});

test("Medium: delivery ratio 60 to 79", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 60, cancellationRatio: 40 })), "check");
  assert.equal(steadfastLabel(score({ deliveryRatio: 79.9, cancellationRatio: 20.1 })), "check");
});

test("Medium: exactly 1 report", () => {
  assert.equal(steadfastLabel(score({ totalReports: 1 })), "check");
});

test("Low: delivery ratio 80 or more with no reports", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 80, cancellationRatio: 20 })), "low");
});

test("low volume caps High at Medium", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 20, cancellationRatio: 80, volumeBand: "low", volumeRange: "1-4" })), "check");
  assert.equal(steadfastLabel(score({ totalReports: 3, volumeRange: "1-4", volumeBand: "medium" })), "check");
  assert.equal(steadfastLabel(score({ doubtfulReports: true, volumeBand: "low", volumeRange: "" })), "check");
});

test("low volume never lowers Medium or Low", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 70, cancellationRatio: 30, volumeRange: "1-4" })), "check");
  assert.equal(steadfastLabel(score({ volumeRange: "1-4", volumeBand: "low" })), "low");
});

test("enough volume keeps High", () => {
  assert.equal(steadfastLabel(score({ deliveryRatio: 20, cancellationRatio: 80, volumeBand: "medium", volumeRange: "5-9" })), "high");
});

test("an unknown band with no readable range counts as low volume", () => {
  assert.equal(isLowVolume(score({ volumeBand: "very_high_plus", volumeRange: "" })), true);
  assert.equal(steadfastLabel(score({ deliveryRatio: 10, cancellationRatio: 90, volumeBand: "mystery", volumeRange: "many" })), "check");
});

test("an unknown band with a readable range goes by the range", () => {
  assert.equal(isLowVolume(score({ volumeBand: "mystery", volumeRange: "25+" })), false);
  assert.equal(isLowVolume(score({ volumeBand: "mystery", volumeRange: "2-3" })), true);
});

test("the lowest band is low volume whatever the range", () => {
  assert.equal(isLowVolume(score({ volumeBand: "LOW", volumeRange: "5-9" })), true);
});

test("volume ranges", () => {
  assert.deepEqual(parseVolumeRange("25+"), { min: 25, max: Infinity });
  assert.deepEqual(parseVolumeRange("5 - 9"), { min: 5, max: 9 });
  assert.deepEqual(parseVolumeRange("0"), { min: 0, max: 0 });
  assert.equal(parseVolumeRange("many"), null);
});

test("thresholds come from the config object", () => {
  const strict = { highBelowDeliveryRatio: 90, lowFromDeliveryRatio: 95, highFromReports: 2, mediumFromReports: 1, lowVolumeUnderParcels: 5, volumeBands: ["low", "medium", "high"] };
  assert.equal(steadfastLabel(score({ deliveryRatio: 85, cancellationRatio: 15 }), strict), "high");
});
