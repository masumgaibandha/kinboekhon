import { syncCustomer } from "@/lib/customers/sync-customer";
import { connectMongoose } from "@/lib/db";
import { combinedRisk, type RiskRow } from "@/lib/fraud/combined-risk";
import { getFraudSettings } from "@/lib/fraud/fraud-settings";
import type { FraudSettings } from "@/lib/fraud/risk";
import { CustomerModel } from "@/lib/models/Customer";
import { DeliveryCheckModel } from "@/lib/models/DeliveryCheck";

const RISK_FIELDS = { phone: 1, delivered: 1, failed: 1, checkedAt: 1, courierScore: 1 };

// Writes the phone's combined label on its customer record, for the orders list badge and filter.
export async function refreshCustomerRisk(phone: string): Promise<void> {
  await connectMongoose();
  const [rows, settings] = await Promise.all([
    DeliveryCheckModel.find({ phone }, RISK_FIELDS).lean<RiskRow[]>(),
    getFraudSettings(),
  ]);
  const label = combinedRisk(rows, settings);
  if (!(await CustomerModel.exists({ phone }))) await syncCustomer(phone);
  await CustomerModel.updateOne({ phone }, label ? { $set: { risk: { label, at: new Date() } } } : { $unset: { risk: 1 } });
}

// After the thresholds change in Settings, every saved label is worked out again from the saved checks.
export async function relabelAllCustomers(settings: FraudSettings): Promise<void> {
  await connectMongoose();
  const rows = await DeliveryCheckModel.find({}, RISK_FIELDS).lean<(RiskRow & { phone: string })[]>();
  const byPhone = new Map<string, RiskRow[]>();
  for (const row of rows) byPhone.set(row.phone, [...(byPhone.get(row.phone) ?? []), row]);
  const updates = [...byPhone].flatMap(([phone, phoneRows]) => {
    const label = combinedRisk(phoneRows, settings);
    return label ? [{ updateOne: { filter: { phone, risk: { $exists: true } }, update: { $set: { "risk.label": label } } } }] : [];
  });
  if (updates.length > 0) await CustomerModel.bulkWrite(updates);
}
