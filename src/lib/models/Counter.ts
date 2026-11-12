import { Schema } from "mongoose";

import { appDb } from "@/lib/db";

interface CounterDocument {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterDocument>(
  { _id: { type: String, required: true }, seq: { type: Number, required: true, default: 0 } },
  { versionKey: false },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Counter) appDb.deleteModel("Counter");

export const CounterModel = appDb.model<CounterDocument>("Counter", counterSchema);
