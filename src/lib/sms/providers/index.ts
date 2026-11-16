import type { SmsProvider } from "@/lib/sms/providers/types";

// No provider is chosen yet. SMS_PROVIDER must match the id of one in this list.
const SMS_PROVIDERS: SmsProvider[] = [];

export interface SmsConnection {
  provider: SmsProvider;
  apiKey: string;
  senderId: string;
}

export type SmsLink = { connected: true; connection: SmsConnection } | { connected: false; reason: string };

export function smsLink(): SmsLink {
  const id = process.env.SMS_PROVIDER?.trim() ?? "";
  const apiKey = process.env.SMS_API_KEY?.trim() ?? "";
  if (!id || !apiKey) return { connected: false, reason: "Set SMS_PROVIDER, SMS_API_KEY and SMS_SENDER_ID to connect." };
  const provider = SMS_PROVIDERS.find((item) => item.id === id);
  if (!provider) return { connected: false, reason: `SMS_PROVIDER "${id}" is not a known provider.` };
  return { connected: true, connection: { provider, apiKey, senderId: process.env.SMS_SENDER_ID?.trim() ?? "" } };
}
