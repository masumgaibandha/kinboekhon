import { connectMongoose } from "@/lib/db";
import { refreshCustomerRisk } from "@/lib/fraud/customer-risk";
import { FRAUD_PROVIDERS } from "@/lib/fraud/providers";
import type { FraudProvider } from "@/lib/fraud/providers/types";
import { DeliveryCheckModel, type DeliveryCheckDocument } from "@/lib/models/DeliveryCheck";

// A good lookup is reused for 24 hours; a failed one can be tried again at once.
export const CHECK_CACHE_MS = 24 * 60 * 60 * 1000;

export function isFresh(row: Pick<DeliveryCheckDocument, "status" | "checkedAt"> | null, now: Date): boolean {
  return row !== null && row.status !== "error" && row.checkedAt !== null && now.getTime() - row.checkedAt.getTime() < CHECK_CACHE_MS;
}

export interface CheckRunSummary {
  checked: number;
  cached: number;
  failed: number;
}

type Outcome = "checked" | "cached" | "failed";

async function runProvider(provider: FraudProvider, phone: string, now: Date): Promise<Outcome> {
  const saved = await DeliveryCheckModel.findOne({ phone, source: provider.id }, { status: 1, checkedAt: 1 }).lean<
    Pick<DeliveryCheckDocument, "status" | "checkedAt">
  >();
  if (isFresh(saved, now)) return "cached";

  const result = await provider.check(phone);
  // A failure keeps the counts of the last good lookup.
  const update =
    result.status === "error"
      ? { status: "error", error: result.error, errorAt: now }
      : { status: result.status, delivered: result.delivered, failed: result.failed, total: result.total, checkedAt: now, error: "", errorAt: null };
  await DeliveryCheckModel.updateOne({ phone, source: provider.id }, { $set: update }, { upsert: true });
  return result.status === "error" ? "failed" : "checked";
}

// Looks the phone up with every connected source. Never changes an order.
export async function checkPhoneHistory(phone: string): Promise<CheckRunSummary> {
  await connectMongoose();
  const now = new Date();
  const outcomes = await Promise.all(FRAUD_PROVIDERS.filter((provider) => provider.connected()).map((provider) => runProvider(provider, phone, now)));
  if (outcomes.includes("checked")) await refreshCustomerRisk(phone);
  return {
    checked: outcomes.filter((outcome) => outcome === "checked").length,
    cached: outcomes.filter((outcome) => outcome === "cached").length,
    failed: outcomes.filter((outcome) => outcome === "failed").length,
  };
}
