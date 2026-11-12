import { connectMongoose } from "@/lib/db";
import { RateLimitModel } from "@/lib/models/RateLimit";

export interface RateWindow {
  name: string;
  max: number;
  windowMs: number;
}

const MINUTE = 60 * 1000;

// Many customers share one address behind their mobile operator, so the order limits per address are loose.
export const ORDER_IP_WINDOWS: RateWindow[] = [
  { name: "10m", max: 10, windowMs: 10 * MINUTE },
  { name: "day", max: 50, windowMs: 24 * 60 * MINUTE },
];

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function countHit(key: string, expiresAt: Date): Promise<number> {
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

// Counts one hit in every window (fixed windows); false when any window is over its limit.
export async function takeRateLimit(scope: string, id: string, windows: RateWindow[]): Promise<boolean> {
  await connectMongoose();
  const now = Date.now();
  const counts = await Promise.all(
    windows.map((window) => {
      const start = Math.floor(now / window.windowMs) * window.windowMs;
      return countHit(`${scope}:${window.name}:${id}:${start}`, new Date(start + window.windowMs));
    }),
  );
  return counts.every((count, index) => count <= windows[index].max);
}
