import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";

interface RateLimitDocument {
  key: string;
  count: number;
  expiresAt: Date;
}

const rateLimitSchema = new Schema<RateLimitDocument>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    // MongoDB removes the counter once its window is over.
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false },
);

// Its own collection, separate from Better Auth's "rateLimit" for the admin login.
export const RateLimitModel = registerModel<RateLimitDocument>("RateLimit", rateLimitSchema, "ratelimits");
