import { Schema } from "mongoose";

import { registerModel } from "@/lib/db";

interface CounterDocument {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterDocument>(
  { _id: { type: String, required: true }, seq: { type: Number, required: true, default: 0 } },
  { versionKey: false },
);

export const CounterModel = registerModel<CounterDocument>("Counter", counterSchema);
