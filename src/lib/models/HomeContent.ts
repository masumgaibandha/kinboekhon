import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";
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

export const HomeContentModel = registerModel<HomeContentDocument>("HomeContent", homeContentSchema);
