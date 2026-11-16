import { connectMongoose } from "@/lib/db";
import { dhakaDay, dhakaDayStart } from "@/lib/dates";
import { SmsLogModel, type SmsStatus } from "@/lib/models/SmsLog";
import { isDuplicateKey } from "@/lib/mongo-errors";
import { smsSize } from "@/lib/sms/parts";
import { smsLink } from "@/lib/sms/providers";
import type { SmsTemplateKind } from "@/lib/sms/templates";

export const DAILY_SMS_LIMIT = 5;
const REPLY_MAX = 300;
// Every try counts toward the daily limit, except the ones skipped before sending.
const COUNTED: SmsStatus[] = ["sending", "sent", "failed", "not_connected"];

export type SmsOutcome = "sent" | "failed" | "not_connected" | "limit" | "blocked" | "duplicate";

interface SmsRequest {
  orderNumber: string;
  phone: string;
  template: SmsTemplateKind;
  text: string;
  blocked: boolean;
}

// The test SMS keeps its once key only when sent, so a failed test can be tried again.
async function finish(id: unknown, status: SmsStatus, reply: string, provider = "", releaseOnce = false): Promise<void> {
  const set = { $set: { status, reply: reply.slice(0, REPLY_MAX), provider } };
  await SmsLogModel.updateOne({ _id: id }, releaseOnce && status !== "sent" ? { ...set, $unset: { onceKey: 1 } } : set);
}

// Safety first: one automatic SMS per template per order, at most 5 per phone per Dhaka day, none for a Blocked customer.
export async function deliverSms({ orderNumber, phone, template, text, blocked }: SmsRequest): Promise<SmsOutcome> {
  await connectMongoose();
  const auto = template !== "manual";
  const release = template === "test";
  const base = { orderNumber, phone, template, text, parts: smsSize(text).parts, ...(auto && { onceKey: `${orderNumber}:${template}` }) };
  if (blocked && !auto) return "blocked";

  // The insert claims the template for this order; a second try hits the unique index.
  let id: unknown;
  try {
    const log = await SmsLogModel.create({ ...base, status: blocked ? "skipped" : "sending", reply: blocked ? "Blocked customer" : "" });
    id = log._id;
  } catch (error) {
    if (isDuplicateKey(error)) return "duplicate";
    throw error;
  }
  if (blocked) return "blocked";

  // Counted after the claim, so two SMS at once cannot both slip under the limit.
  const today = await SmsLogModel.countDocuments({ phone, status: { $in: COUNTED }, createdAt: { $gte: dhakaDayStart(dhakaDay(new Date())) } });
  if (today > DAILY_SMS_LIMIT) {
    await finish(id, "skipped", `Daily limit of ${DAILY_SMS_LIMIT} SMS for this phone reached`, "", release);
    return "limit";
  }

  const link = smsLink();
  if (!link.connected) {
    console.info(`SMS not connected. Would send ${template} SMS for ${orderNumber} to ${phone}: ${text}`);
    await finish(id, "not_connected", "SMS not connected: logged only, not sent", "", release);
    return "not_connected";
  }

  const { provider, apiKey, senderId } = link.connection;
  const result = await provider.send({ phone, text, apiKey, senderId }).catch(() => ({ ok: false, reply: "network" }));
  await finish(id, result.ok ? "sent" : "failed", result.reply, provider.id, release);
  return result.ok ? "sent" : "failed";
}
