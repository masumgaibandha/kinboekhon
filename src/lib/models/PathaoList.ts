import { Schema } from "mongoose";

import { appDb } from "@/lib/db";

export interface PathaoPlace {
  id: number;
  name: string;
}

// A cached Pathao list: the cities, the zones of one city or the areas of one zone.
export interface PathaoListDocument {
  key: string;
  items: PathaoPlace[];
  fetchedAt: Date;
}

const pathaoListSchema = new Schema<PathaoListDocument>({
  key: { type: String, required: true, unique: true },
  items: [{ _id: false, id: { type: Number, required: true }, name: { type: String, required: true } }],
  fetchedAt: { type: Date, required: true },
});

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.PathaoList) appDb.deleteModel("PathaoList");

export const PathaoListModel = appDb.model<PathaoListDocument>("PathaoList", pathaoListSchema);
