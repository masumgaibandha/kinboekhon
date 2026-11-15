import { syncCustomer } from "@/lib/customers/sync-customer";
import { connectMongoose } from "@/lib/db";
import { getFraudSettings } from "@/lib/fraud/fraud-settings";
import { riskLabel, type FraudSettings, type HistoryCounts } from "@/lib/fraud/risk";
import { CustomerModel } from "@/lib/models/Customer";
import { DeliveryCheckModel, type DeliveryCheckDocument } from "@/lib/models/DeliveryCheck";

type CountedRow = Pick<DeliveryCheckDocument, "delivered" | "failed" | "checkedAt">;

// Sums every source that has counts. Null when no source ever gave or got any.
export function sumCounts(rows: CountedRow[]): HistoryCounts | null {
  const usable = rows.filter((row) => row.checkedAt && row.delivered !== null && row.failed !== null);
  if (usable.length === 0) return null;
  return usable.reduce(
    (sum, row) => ({ delivered: sum.delivered + (row.delivered ?? 0), failed: sum.failed + (row.failed ?? 0) }),
    { delivered: 0, failed: 0 },
  );
}

// Writes the phone's summed history and label on its customer record, for the orders list badge and filter.
export async function refreshCustomerRisk(phone: string): Promise<void> {
  await connectMongoose();
  const [rows, settings] = await Promise.all([
    DeliveryCheckModel.find({ phone }, { delivered: 1, failed: 1, checkedAt: 1 }).lean<CountedRow[]>(),
    getFraudSettings(),
  ]);
  const counts = sumCounts(rows);
  if (!(await CustomerModel.exists({ phone }))) await syncCustomer(phone);
  await CustomerModel.updateOne(
    { phone },
    counts ? { $set: { risk: { ...counts, label: riskLabel(counts, settings), at: new Date() } } } : { $unset: { risk: 1 } },
  );
}

// After the thresholds change in Settings, every saved label is worked out again.
export async function relabelAllCustomers(settings: FraudSettings): Promise<void> {
  await connectMongoose();
  const customers = await CustomerModel.find({ risk: { $exists: true } }, { _id: 1, risk: 1 }).lean<
    { _id: unknown; risk: HistoryCounts }[]
  >();
  if (customers.length === 0) return;
  await CustomerModel.bulkWrite(
    customers.map((customer) => ({
      updateOne: { filter: { _id: customer._id }, update: { $set: { "risk.label": riskLabel(customer.risk, settings) } } },
    })),
  );
}
