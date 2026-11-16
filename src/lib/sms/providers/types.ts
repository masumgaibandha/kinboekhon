export interface SmsSendInput {
  // 01XXXXXXXXX; a provider that wants 8801XXXXXXXXX adds the country code itself.
  phone: string;
  text: string;
  apiKey: string;
  senderId: string;
}

// `reply` is the provider's short answer, saved in the SMS log.
export interface SmsSendResult {
  ok: boolean;
  reply: string;
}

// One Bangladesh bulk SMS provider. Add one by adding a file here and listing it in index.ts.
export interface SmsProvider {
  id: string;
  label: string;
  send(input: SmsSendInput): Promise<SmsSendResult>;
}
