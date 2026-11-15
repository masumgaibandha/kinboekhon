import { Schema } from "mongoose";

import { appDb } from "@/lib/db";
import { costsSchema } from "@/lib/models/costs-schema";
import type { ProductFormValues } from "@/lib/validation/product";

const reviewSchema = new Schema({ name: String, text: String }, { _id: false });

const imageSchema = new Schema(
  { publicId: { type: String, required: true }, width: Number, height: Number },
  { _id: false },
);

// Stock is changed only through logged stock moves, never by the product form.
export type ProductDocument = ProductFormValues & { stock: number; lowStockLevel: number };

export const DEFAULT_LOW_STOCK_LEVEL = 5;

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    shortDescription: String,
    images: [imageSchema],
    hook: { headline: String, subheadline: String },
    problem: { title: String, points: [String] },
    story: { title: String, body: String },
    solution: { title: String, benefits: [String], images: [imageSchema] },
    proof: { title: String, images: [imageSchema], reviews: [reviewSchema] },
    cta: { title: String, text: String },
    active: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    costs: costsSchema,
    stock: { type: Number, default: 0 },
    lowStockLevel: { type: Number, default: DEFAULT_LOW_STOCK_LEVEL, min: 0 },
  },
  { timestamps: true },
);

productSchema.index({ active: 1, sortOrder: 1 });

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Product) appDb.deleteModel("Product");

export const ProductModel = appDb.model<ProductDocument>("Product", productSchema);
