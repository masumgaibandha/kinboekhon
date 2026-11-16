import type { SmsLink } from "@/lib/sms/providers";
import type { SmsBalance } from "@/lib/sms/providers/types";

// Read live from the provider on each visit; null when not connected or the provider has no balance API.
export async function getSmsBalance(link: SmsLink): Promise<SmsBalance | null> {
  if (!link.connected) return null;
  const { provider, apiKey } = link.connection;
  if (!provider.balance) return null;
  return provider.balance(apiKey).catch((): SmsBalance => ({ ok: false, reply: "network" }));
}
