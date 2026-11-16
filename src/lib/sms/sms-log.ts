import { connectMongoose } from "@/lib/db";
import { dhakaMonthStart } from "@/lib/dates";
import { SmsLogModel, type SmsLogDocument, type SmsStatus } from "@/lib/models/SmsLog";

export const SMS_LOG_LIMIT = 100;

export type SmsLogRow = Pick<SmsLogDocument, "orderNumber" | "phone" | "template" | "text" | "parts" | "status" | "provider" | "reply" | "createdAt"> & {
  id: string;
};

const ROW_FIELDS = { orderNumber: 1, phone: 1, template: 1, text: 1, parts: 1, status: 1, provider: 1, reply: 1, createdAt: 1 };

async function readRows(filter: Record<string, unknown>, limit: number): Promise<SmsLogRow[]> {
  await connectMongoose();
  const docs = await SmsLogModel.find(filter, ROW_FIELDS).sort({ createdAt: -1 }).limit(limit).lean<(SmsLogRow & { _id: unknown })[]>();
  return docs.map(({ _id, ...row }) => ({ ...row, id: String(_id) }));
}

export function getSmsLog(): Promise<SmsLogRow[]> {
  return readRows({}, SMS_LOG_LIMIT);
}

export function getOrderSmsLog(orderNumber: string): Promise<SmsLogRow[]> {
  return readRows({ orderNumber }, 50);
}

export interface SmsMonth {
  sent: number;
  sentParts: number;
  notConnected: number;
  notConnectedParts: number;
  failed: number;
  skipped: number;
}

// This Dhaka month's SMS by status.
export async function getSmsMonth(now = new Date()): Promise<SmsMonth> {
  await connectMongoose();
  const rows = await SmsLogModel.aggregate<{ _id: SmsStatus; count: number; parts: number }>([
    { $match: { createdAt: { $gte: dhakaMonthStart(now) } } },
    { $group: { _id: "$status", count: { $sum: 1 }, parts: { $sum: "$parts" } } },
  ]);
  const of = (status: SmsStatus) => rows.find((row) => row._id === status) ?? { count: 0, parts: 0 };
  return {
    sent: of("sent").count,
    sentParts: of("sent").parts,
    notConnected: of("not_connected").count,
    notConnectedParts: of("not_connected").parts,
    failed: of("failed").count,
    skipped: of("skipped").count,
  };
}
