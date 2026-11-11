import { Schema, type Model } from "mongoose";

import { appDb } from "@/lib/db";
import type { ProductInput } from "@/lib/validation/product";

const reviewSchema = new Schema({ name: String, text: String }, { _id: false });

const productSchema = new Schema<ProductInput>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
    shortDescription: String,
    hook: { headline: String, subheadline: String },
    problem: { title: String, points: [String] },
    story: { title: String, body: String },
    solution: { title: String, benefits: [String] },
    proof: { title: String, reviews: [reviewSchema] },
    cta: { title: String, text: String },
    active: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ active: 1, sortOrder: 1 });

export const ProductModel =
  (appDb.models.Product as Model<ProductInput> | undefined) ??
  appDb.model<ProductInput>("Product", productSchema);
