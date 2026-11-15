import { Schema } from "mongoose";

import { appDb } from "@/lib/db";

// The Pathao access token, one per API account (base URL + client id), so sandbox and live never mix. Server only.
export interface PathaoTokenDocument {
  account: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

const pathaoTokenSchema = new Schema<PathaoTokenDocument>(
  {
    account: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.PathaoToken) appDb.deleteModel("PathaoToken");

export const PathaoTokenModel = appDb.model<PathaoTokenDocument>("PathaoToken", pathaoTokenSchema);
