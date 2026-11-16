import { Schema, type Types } from "mongoose";

import { registerModel } from "@/lib/db";

// purchase: stock bought in; shipped: sent to the courier; returned: a parcel came back;
// damaged: a returned parcel marked damaged after it was put back; adjustment: a manual change with a reason.
export const STOCK_MOVE_KINDS = ["purchase", "shipped", "returned", "damaged", "adjustment"] as const;
export type StockMoveKind = (typeof STOCK_MOVE_KINDS)[number];

export interface StockMoveDocument {
  productId: Types.ObjectId;
  kind: StockMoveKind;
  // Units added (positive) or taken out (negative).
  change: number;
  // The product's stock right after this move.
  balance: number;
  // Whole taka per unit, purchases only.
  unitCost?: number;
  note: string;
  orderNumber?: string;
  createdAt: Date;
}

const stockMoveSchema = new Schema<StockMoveDocument>(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: STOCK_MOVE_KINDS, required: true },
    change: { type: Number, required: true },
    balance: { type: Number, required: true },
    unitCost: Number,
    note: { type: String, default: "" },
    orderNumber: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

stockMoveSchema.index({ productId: 1, createdAt: -1 });

export const StockMoveModel = registerModel<StockMoveDocument>("StockMove", stockMoveSchema);
