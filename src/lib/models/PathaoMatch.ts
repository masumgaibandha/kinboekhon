import { Schema } from "mongoose";

import { appDb } from "@/lib/db";

// An admin correction, reused for later orders: our district to a Pathao city, or our upazila / thana to a zone.
export interface PathaoMatchDocument {
  key: string;
  pathaoId: number;
  name: string;
}

const pathaoMatchSchema = new Schema<PathaoMatchDocument>(
  {
    key: { type: String, required: true, unique: true },
    pathaoId: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.PathaoMatch) appDb.deleteModel("PathaoMatch");

export const PathaoMatchModel = appDb.model<PathaoMatchDocument>("PathaoMatch", pathaoMatchSchema);
