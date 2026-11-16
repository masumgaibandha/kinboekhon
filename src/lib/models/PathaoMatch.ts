import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";

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

export const PathaoMatchModel = registerModel<PathaoMatchDocument>("PathaoMatch", pathaoMatchSchema);
