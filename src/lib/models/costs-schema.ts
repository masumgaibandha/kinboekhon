import { Schema } from "mongoose";

// Price calculator inputs: Settings keeps the defaults, each product keeps its own copy with China price and weight.
export const costsSchema = new Schema(
  {
    chinaPrice: Number,
    weightGrams: Number,
    shippingPerKg: Number,
    agentFee: Number,
    packaging: Number,
    returnPercent: Number,
    adCost: Number,
    targetProfit: Number,
  },
  { _id: false },
);
