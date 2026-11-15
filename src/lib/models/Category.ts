import { Schema } from "mongoose";

import { appDb } from "@/lib/db";
import { imageSchema } from "@/lib/models/image-schema";
import type { CategoryValues } from "@/lib/validation/category";

export type CategoryDocument = CategoryValues & { isDemo: boolean };

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: imageSchema, default: null },
    sortOrder: { type: Number, default: 0 },
    // Demo data for testing, removed by `npm run demo:clear`.
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.index({ sortOrder: 1, createdAt: 1 });

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Category) appDb.deleteModel("Category");

export const CategoryModel = appDb.model<CategoryDocument>("Category", categorySchema);
