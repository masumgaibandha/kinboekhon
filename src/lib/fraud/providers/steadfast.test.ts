import assert from "node:assert/strict";
import { test } from "node:test";

import { readScore } from "@/lib/fraud/providers/steadfast";

// The live GET /fraud_check/score answer for a phone with 25+ delivered parcels (November 2026).
const LIVE = {
  status: 200,
  phone: "01712345678",
  score: null,
  level: null,
  reasons: [],
  scoring_disabled: true,
  doubtful_reports: false,
  total_reports: 0,
  delivery_ratio: 100,
  cancellation_ratio: 0,
  volume_band: "high",
  volume_range: "25+",
  delivered_count: null,
  cancelled_count: null,
  fraud_categories: [],
  return_ratio: 0,
};

test("reads the live score answer", () => {
  assert.deepEqual(readScore(LIVE), {
    status: "found",
    score: {
      deliveryRatio: 100,
      cancellationRatio: 0,
      volumeBand: "high",
      volumeRange: "25+",
      totalReports: 0,
      doubtfulReports: false,
      score: null,
      level: "",
    },
  });
});

test("keeps a score and level when they come back", () => {
  const result = readScore({ ...LIVE, score: "72", level: "medium" });
  assert.equal(result.status, "found");
  if (result.status === "found") {
    assert.equal(result.score.score, 72);
    assert.equal(result.score.level, "medium");
  }
});

test("a phone with no parcels is no history", () => {
  const result = readScore({ ...LIVE, delivery_ratio: 0, cancellation_ratio: 0, volume_band: "none", volume_range: "0" });
  assert.equal(result.status, "no_history");
});

test("odd values are read safely", () => {
  const result = readScore({ ...LIVE, delivery_ratio: "abc", cancellation_ratio: 140, volume_band: 7, total_reports: [1, 2] });
  assert.equal(result.status, "found");
  if (result.status === "found") {
    assert.equal(result.score.deliveryRatio, null);
    assert.equal(result.score.cancellationRatio, null);
    assert.equal(result.score.volumeBand, "");
    assert.equal(result.score.totalReports, 0);
  }
});

test("the retired /fraud_check answer with its sunset notice is an error, not no history", () => {
  const body = {
    total_parcels: 0,
    total_delivered: 0,
    total_cancelled: 0,
    return_ratio: 0,
    total_fraud_reports: [],
    notice: "Since 27 September 2026 this endpoint no longer returns parcel counts; every count here is 0.",
    sunset: "2026-09-27",
  };
  assert.deepEqual(readScore(body), { status: "error", error: "endpoint_retired" });
});

test("an answer without the ratios is a bad response", () => {
  assert.deepEqual(readScore({ status: 401, message: "Unauthorized" }), { status: "error", error: "bad_response" });
  assert.deepEqual(readScore(null), { status: "error", error: "bad_response" });
});
