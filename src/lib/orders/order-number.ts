import { CounterModel } from "@/lib/models/Counter";

const ORDER_COUNTER = "order";
const ORDER_NUMBER_BASE = 10000;

// Atomic increment, so two orders at the same moment never share a number. The first order is KE10001.
export async function nextOrderNumber(): Promise<string> {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: ORDER_COUNTER },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  ).lean<{ seq: number }>();
  if (!counter) throw new Error("Order counter missing");
  return `KE${ORDER_NUMBER_BASE + counter.seq}`;
}
