import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { CALL_OUTCOMES, type CallOutcome } from "@/lib/orders/enums";

// Pending orders that still need a call: never called, or the latest call did not reach a decision.
export const CALL_TODO = ["none", "no_answer", "call_later"] as const;
export type CallTodo = (typeof CALL_TODO)[number];

const TODO_OUTCOMES: (CallOutcome | null)[] = [null, "no_answer", "call_later"];
const NEEDS_CALL = { status: "pending" as const, "lastCall.outcome": { $in: TODO_OUTCOMES } };

export interface CallResults {
  calls: number;
  byOutcome: Record<CallOutcome, number>;
  ordersCalled: number;
  confirmRate: number | null;
}

export interface CallQueueItem {
  orderNumber: string;
  createdAt: Date;
  name: string;
  phone: string;
  lastCall: CallOutcome | null;
}

export async function getCallTodo(): Promise<Record<CallTodo, number>> {
  await connectMongoose();
  const rows = await OrderModel.aggregate<{ _id: CallOutcome | null; count: number }>([
    { $match: NEEDS_CALL },
    { $group: { _id: { $ifNull: ["$lastCall.outcome", null] }, count: { $sum: 1 } } },
  ]);
  const todo: Record<CallTodo, number> = { none: 0, no_answer: 0, call_later: 0 };
  for (const row of rows) {
    const key = row._id ?? "none";
    if (key in todo) todo[key as CallTodo] = row.count;
  }
  return todo;
}

// Calls made since `start` (all calls when null). Confirm rate: orders with an Agreed call out of orders called.
export async function getCallResults(start: Date | null): Promise<CallResults> {
  await connectMongoose();
  // The latest call is the newest one, so an order with a call in the period has lastCall.at in it too.
  const match = start ? { "lastCall.at": { $gte: start } } : { "lastCall.outcome": { $ne: null } };
  const inPeriod = start ? [{ $eq: ["$$entry.kind", "call"] }, { $gte: ["$$entry.at", start] }] : [{ $eq: ["$$entry.kind", "call"] }];

  const rows = await OrderModel.aggregate<{ outcomes: CallOutcome[] }>([
    { $match: match },
    {
      $project: {
        _id: 0,
        outcomes: {
          $map: {
            input: { $filter: { input: "$statusHistory", as: "entry", cond: { $and: inPeriod } } },
            as: "entry",
            in: "$$entry.outcome",
          },
        },
      },
    },
  ]);

  const byOutcome = Object.fromEntries(CALL_OUTCOMES.map((outcome) => [outcome, 0])) as Record<CallOutcome, number>;
  let calls = 0;
  let agreedOrders = 0;
  for (const { outcomes } of rows) {
    for (const outcome of outcomes) byOutcome[outcome] += 1;
    calls += outcomes.length;
    if (outcomes.includes("agreed_to_wait")) agreedOrders += 1;
  }
  const ordersCalled = rows.length;
  const confirmRate = ordersCalled === 0 ? null : Math.round((agreedOrders / ordersCalled) * 1000) / 10;
  return { calls, byOutcome, ordersCalled, confirmRate };
}

interface QueueDoc {
  orderNumber: string;
  createdAt: Date;
  customer: { name: string; phone: string };
  lastCall?: { outcome?: CallOutcome };
}

// The oldest pending orders that still need a call, first in line first.
export async function getCallQueue(limit = 5): Promise<CallQueueItem[]> {
  await connectMongoose();
  const docs = await OrderModel.find(NEEDS_CALL, {
    orderNumber: 1,
    createdAt: 1,
    "customer.name": 1,
    "customer.phone": 1,
    "lastCall.outcome": 1,
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean<QueueDoc[]>();

  return docs.map((doc) => ({
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    name: doc.customer.name,
    phone: doc.customer.phone,
    lastCall: doc.lastCall?.outcome ?? null,
  }));
}
