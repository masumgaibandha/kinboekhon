import assert from "node:assert/strict";
import { test } from "node:test";

import { combinedRisk, type RiskRow } from "@/lib/fraud/combined-risk";
import type { CourierScore } from "@/lib/fraud/providers/types";
import { DEFAULT_FRAUD_SETTINGS } from "@/lib/fraud/risk";

const at = new Date("2026-11-17T06:00:00Z");
const good: CourierScore = {
  deliveryRatio: 100,
  cancellationRatio: 0,
  volumeBand: "high",
  volumeRange: "25+",
  totalReports: 0,
  doubtfulReports: false,
  score: null,
  level: "",
};
const steadfast = (score: CourierScore): RiskRow => ({ delivered: null, failed: null, checkedAt: at, courierScore: score });
const manual = (delivered: number, failed: number): RiskRow => ({ delivered, failed, checkedAt: at, courierScore: null });

test("nothing to go on is null", () => {
  assert.equal(combinedRisk([], DEFAULT_FRAUD_SETTINGS), null);
});

test("Steadfast alone gives its own label", () => {
  assert.equal(combinedRisk([steadfast(good)], DEFAULT_FRAUD_SETTINGS), "low");
});

test("the riskier source wins", () => {
  assert.equal(combinedRisk([steadfast(good), manual(1, 4)], DEFAULT_FRAUD_SETTINGS), "high");
  assert.equal(combinedRisk([steadfast({ ...good, totalReports: 2 }), manual(10, 0)], DEFAULT_FRAUD_SETTINGS), "high");
});

test("a new Steadfast customer does not hide manual counts", () => {
  const none = { ...good, deliveryRatio: 0, cancellationRatio: 0, volumeBand: "none", volumeRange: "0" };
  assert.equal(combinedRisk([steadfast(none), manual(10, 0)], DEFAULT_FRAUD_SETTINGS), "low");
});
