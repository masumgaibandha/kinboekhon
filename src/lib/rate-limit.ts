import { connectMongoose } from "@/lib/db";
import { RateLimitModel } from "@/lib/models/RateLimit";

export interface RateWindow {
  name: string;
  max: number;
  windowMs: number;
}

const MINUTE = 60 * 1000;

// Every request to /api/orders, whatever its content, so bots can't hammer the endpoint.
export const REQUEST_IP_WINDOWS: RateWindow[] = [{ name: "10m", max: 30, windowMs: 10 * MINUTE }];

// Draft saves from the order form: one per field blur, so a customer makes several.
export const DRAFT_IP_WINDOWS: RateWindow[] = [{ name: "10m", max: 60, windowMs: 10 * MINUTE }];

// Only placed orders and failed Turnstile checks count, so customers sharing a carrier address aren't blocked by form mistakes.
export const ORDER_IP_WINDOWS: RateWindow[] = [
  { name: "10m", max: 10, windowMs: 10 * MINUTE },
  { name: "day", max: 50, windowMs: 24 * 60 * MINUTE },
];

interface WindowKey {
  key: string;
  expiresAt: Date;
}

// Fixed windows: the key names the window's start, and the record expires when it ends.
function windowKeys(scope: string, id: string, windows: RateWindow[]): WindowKey[] {
  const now = Date.now();
  return windows.map((window) => {
    const start = Math.floor(now / window.windowMs) * window.windowMs;
    return { key: `${scope}:${window.name}:${id}:${start}`, expiresAt: new Date(start + window.windowMs) };
  });
}

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function countHit({ key, expiresAt }: WindowKey): Promise<number> {
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  try {
    const doc = await RateLimitModel.findOneAndUpdate({ key }, update, { upsert: true, returnDocument: "after" }).lean();
    return doc?.count ?? 1;
  } catch (error) {
    // Two first hits at the same moment: one insert wins, the other retries as an update.
    if (!isDuplicateKey(error)) throw error;
    const doc = await RateLimitModel.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { returnDocument: "after" }).lean();
    return doc?.count ?? 1;
  }
}

// Counts one hit in every window; false when any window is over its limit.
export async function takeRateLimit(scope: string, id: string, windows: RateWindow[]): Promise<boolean> {
  await connectMongoose();
  const counts = await Promise.all(windowKeys(scope, id, windows).map(countHit));
  return counts.every((count, index) => count <= windows[index].max);
}

// True when any window has already reached its limit; counts nothing.
export async function isRateLimited(scope: string, id: string, windows: RateWindow[]): Promise<boolean> {
  await connectMongoose();
  const keys = windowKeys(scope, id, windows);
  const docs = await RateLimitModel.find({ key: { $in: keys.map((k) => k.key) } }, { key: 1, count: 1 }).lean();
  return keys.some(({ key }, index) => (docs.find((doc) => doc.key === key)?.count ?? 0) >= windows[index].max);
}

// Counts one hit in every window without checking the limit.
export async function countRateLimit(scope: string, id: string, windows: RateWindow[]): Promise<void> {
  await connectMongoose();
  await Promise.all(windowKeys(scope, id, windows).map(countHit));
}
