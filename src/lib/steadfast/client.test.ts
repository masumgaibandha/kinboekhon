import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { SteadfastBlockedError, steadfastRequest } from "@/lib/steadfast/client";

const env = process.env as Record<string, string | undefined>;
const saved = { NODE_ENV: env.NODE_ENV, STEADFAST_API_KEY: env.STEADFAST_API_KEY, STEADFAST_SECRET_KEY: env.STEADFAST_SECRET_KEY };
const realFetch = globalThis.fetch;
let fetchCalls: string[] = [];

beforeEach(() => {
  fetchCalls = [];
  env.STEADFAST_API_KEY = "test-api-key";
  env.STEADFAST_SECRET_KEY = "test-secret-key";
  // Nothing in these tests may reach the network.
  globalThis.fetch = (async (url: string | URL | Request) => {
    fetchCalls.push(String(url));
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete env[key];
    else env[key] = value;
  }
});

const WRITES: [string, string][] = [
  ["POST", "/create_order"],
  ["POST", "/create_order/bulk-order"],
  ["POST", "/create_return_request"],
  ["POST", "/create_pickup_request"],
  ["POST", "/fraud_check/01712345678"],
  ["POST", "/fraud_check/score/01712345678"],
  ["GET", "/fraud_check/score/../../create_order"],
  ["GET", "/get_balance/../create_order"],
];

for (const nodeEnv of ["development", "test"]) {
  test(`${nodeEnv}: create_order is blocked before any request is sent`, async () => {
    env.NODE_ENV = nodeEnv;
    await assert.rejects(steadfastRequest("POST", "/create_order", { invoice: "KE10001" }), SteadfastBlockedError);
    assert.deepEqual(fetchCalls, []);
  });

  test(`${nodeEnv}: every write call is blocked`, async () => {
    env.NODE_ENV = nodeEnv;
    for (const [method, path] of WRITES) {
      await assert.rejects(steadfastRequest(method, path, {}), SteadfastBlockedError, `${method} ${path}`);
    }
    assert.deepEqual(fetchCalls, []);
  });

  test(`${nodeEnv}: fraud_check, fraud_check/score and get_balance are allowed`, async () => {
    env.NODE_ENV = nodeEnv;
    await steadfastRequest("GET", "/fraud_check/01712345678");
    await steadfastRequest("GET", "/fraud_check/score/01712345678");
    await steadfastRequest("GET", "/get_balance");
    assert.deepEqual(fetchCalls, [
      "https://portal.packzy.com/api/v1/fraud_check/01712345678",
      "https://portal.packzy.com/api/v1/fraud_check/score/01712345678",
      "https://portal.packzy.com/api/v1/get_balance",
    ]);
  });
}

test("NODE_ENV unset: create_order is blocked", async () => {
  delete env.NODE_ENV;
  await assert.rejects(steadfastRequest("POST", "/create_order", {}), SteadfastBlockedError);
  assert.deepEqual(fetchCalls, []);
});

test("production: create_order is let through to the request", async () => {
  env.NODE_ENV = "production";
  await steadfastRequest("POST", "/create_order", {});
  assert.deepEqual(fetchCalls, ["https://portal.packzy.com/api/v1/create_order"]);
});
