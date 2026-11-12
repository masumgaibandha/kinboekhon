import { Schema } from "mongoose";

import { appDb } from "@/lib/db";

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

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.RateLimit) appDb.deleteModel("RateLimit");

// Its own collection, separate from Better Auth's "rateLimit" for the admin login.
export const RateLimitModel = appDb.model<RateLimitDocument>("RateLimit", rateLimitSchema, "ratelimits");
