import { Schema } from "mongoose";

import { appDb } from "@/lib/db";
import { imageSchema } from "@/lib/models/image-schema";
import type { HomeContentValues } from "@/lib/validation/home-content";

type HomeContentDocument = HomeContentValues & { key: string };

const faqSchema = new Schema({ question: String, answer: String }, { _id: false });

const homeContentSchema = new Schema<HomeContentDocument>(
  {
    key: { type: String, required: true, unique: true },
    trust: [String],
    why: { title: String, body: String, founderName: String, founderPhoto: { type: imageSchema, default: null } },
    faq: [faqSchema],
  },
  { timestamps: true },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.HomeContent) appDb.deleteModel("HomeContent");

export const HomeContentModel = appDb.model<HomeContentDocument>("HomeContent", homeContentSchema);
