import { toInternationalPhone } from "@/lib/phone";
import type { SmsProvider } from "@/lib/sms/providers/types";

const API = "https://bulksmsbd.net/api";
const TIMEOUT_MS = 15000;
const SUCCESS = 202;

const CODE_MEANINGS: Record<number, string> = {
  202: "SMS submitted",
  1001: "Invalid number",
  1002: "Sender ID not correct or disabled",
  1003: "Required fields missing",
  1005: "Provider internal error",
  1006: "Balance validity not available",
  1007: "Balance insufficient",
  1011: "User ID not found",
  1012: "Masking SMS must be in Bangla",
  1013: "Sender ID has no gateway for this API key",
  1014: "Sender type not found for this sender ID",
  1015: "Sender ID has no valid gateway for this API key",
  1016: "No active price for this sender ID",
  1017: "No price for this sender ID",
  1018: "Account is disabled",
  1019: "Price for this sender type is disabled on the account",
  1020: "Parent account not found",
  1021: "Parent account has no active price",
  1031: "Account not verified",
  1032: "IP not whitelisted",
};

function codeReply(code: number): string {
  return `${code}: ${CODE_MEANINGS[code] ?? "Unknown code"}`;
}

async function call(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const response = await fetch(`${API}/${path}`, {
    method: "POST",
    body: new URLSearchParams(params),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await response.text();
  try {
    const json: unknown = JSON.parse(body);
    if (json && typeof json === "object") return json as Record<string, unknown>;
  } catch {}
  return { raw: `HTTP ${response.status}: ${body.slice(0, 200)}` };
}

export const bulkSmsBd: SmsProvider = {
  id: "bulksmsbd",
  label: "BulkSMSBD",

  async send({ phone, text, apiKey, senderId }) {
    const json = await call("smsapi", { api_key: apiKey, senderid: senderId, number: toInternationalPhone(phone), message: text, type: "text" });
    const code = Number(json.response_code);
    if (!Number.isFinite(code)) return { ok: false, reply: String(json.raw ?? "No response code") };
    const id = json.message_id ? ` (message ${String(json.message_id)})` : "";
    return { ok: code === SUCCESS, reply: `${codeReply(code)}${code === SUCCESS ? id : ""}` };
  },

  async balance(apiKey) {
    const json = await call("getBalanceApi", { api_key: apiKey });
    const balance = Number(json.balance);
    if (json.balance !== undefined && Number.isFinite(balance)) return { ok: true, balance };
    const code = Number(json.response_code);
    return { ok: false, reply: Number.isFinite(code) ? codeReply(code) : String(json.raw ?? "No balance in reply") };
  },
};
