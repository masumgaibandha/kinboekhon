import { isProductionDb } from "@/lib/db";
import { bulkSmsBd } from "@/lib/sms/providers/bulksmsbd";
import type { SmsProvider } from "@/lib/sms/providers/types";

// SMS_PROVIDER must match the id of one in this list.
const SMS_PROVIDERS: SmsProvider[] = [bulkSmsBd];

export interface SmsConnection {
  provider: SmsProvider;
  apiKey: string;
  senderId: string;
}

export type SmsLink = { connected: true; connection: SmsConnection } | { connected: false; reason: string };

// Real SMS go out only from a production build on the production database, so dev and tests never send.
export function smsLink(): SmsLink {
  if (process.env.NODE_ENV !== "production" || !isProductionDb) {
    return { connected: false, reason: "SMS is sent only from the live site on the production database." };
  }
  const id = process.env.SMS_PROVIDER?.trim() ?? "";
  const apiKey = process.env.SMS_API_KEY?.trim() ?? "";
  const senderId = process.env.SMS_SENDER_ID?.trim() ?? "";
  if (!id || !apiKey || !senderId) return { connected: false, reason: "Set SMS_PROVIDER, SMS_API_KEY and SMS_SENDER_ID to connect." };
  const provider = SMS_PROVIDERS.find((item) => item.id === id);
  if (!provider) return { connected: false, reason: `SMS_PROVIDER "${id}" is not a known provider.` };
  return { connected: true, connection: { provider, apiKey, senderId } };
}
