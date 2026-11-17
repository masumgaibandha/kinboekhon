import assert from "node:assert/strict";
import { test } from "node:test";

import { readCounts } from "@/lib/fraud/providers/steadfast";

test("reads the fraud_check answer from the Steadfast docs", () => {
  const body = { total_parcels: 24, total_delivered: 9, total_cancelled: 15, total_fraud_reports: [] };
  assert.deepEqual(readCounts(body), { status: "found", delivered: 9, failed: 15, total: 24 });
});

test("zero parcels is no history", () => {
  assert.deepEqual(readCounts({ total_parcels: 0, total_delivered: 0, total_cancelled: 0 }), {
    status: "no_history",
    delivered: 0,
    failed: 0,
    total: 0,
  });
});

test("the retired endpoint answer with its sunset notice is an error, not no history", () => {
  const body = {
    total_parcels: 0,
    total_delivered: 0,
    total_cancelled: 0,
    return_ratio: 0,
    total_fraud_reports: [],
    notice: "Since 27 September 2026 this endpoint no longer returns parcel counts; every count here is 0.",
    sunset: "2026-09-27",
  };
  assert.deepEqual(readCounts(body), { status: "error", error: "endpoint_retired" });
});

test("an answer without the counts is a bad response", () => {
  assert.deepEqual(readCounts({ status: 401, message: "Unauthorized" }), { status: "error", error: "bad_response" });
  assert.deepEqual(readCounts(null), { status: "error", error: "bad_response" });
});
