import { Schema, type Types } from "mongoose";

import { BENEFIT_ICON_KEYS } from "@/lib/landing/benefit-icons";
import { appDb } from "@/lib/db";
import { imageSchema } from "@/lib/models/image-schema";
import type { LandingValues } from "@/lib/validation/landing";

export type LandingDocument = LandingValues & { productId: Types.ObjectId; isDemo: boolean };

const titled = <T extends object>(fields: T) => ({ title: String, ...fields });

// One ad landing page per product, shown at /l/<product slug> while both are active.
const landingSchema = new Schema<LandingDocument>(
  {
    productId: { type: Schema.Types.ObjectId, required: true, unique: true },
    active: { type: Boolean, default: false },
    headline: String,
    subheadline: String,
    heroImage: { type: imageSchema, default: null },
    heroVideoUrl: String,
    problem: titled({ points: [String] }),
    solution: titled({ text: String }),
    benefits: titled({
      items: [new Schema({ icon: { type: String, enum: BENEFIT_ICON_KEYS }, text: String }, { _id: false })],
    }),
    gallery: titled({ images: [imageSchema] }),
    howTo: titled({ steps: [String] }),
    inBox: titled({ items: [String] }),
    specs: titled({ rows: [new Schema({ label: String, value: String }, { _id: false })] }),
    guarantee: String,
    faq: [new Schema({ question: String, answer: String }, { _id: false })],
    // Demo data for testing, removed by `npm run demo:clear`.
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.LandingPage) appDb.deleteModel("LandingPage");

export const LandingPageModel = appDb.model<LandingDocument>("LandingPage", landingSchema);
