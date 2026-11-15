import { connectMongoose } from "@/lib/db";
import { CustomerModel } from "@/lib/models/Customer";
import { OrderModel } from "@/lib/models/Order";

interface LatestOrder {
  createdAt: Date;
  customer: { name: string; location: { district: string } };
}

// Creates or refreshes the customer record of a phone from its newest order. Tags and notes are kept.
export async function syncCustomer(phone: string): Promise<void> {
  await connectMongoose();
  const latest = await OrderModel.findOne(
    { "customer.phone": phone },
    { createdAt: 1, "customer.name": 1, "customer.location.district": 1 },
  )
    .sort({ createdAt: -1 })
    .lean<LatestOrder>();
  if (!latest) return;
  await CustomerModel.updateOne(
    { phone },
    { $set: { name: latest.customer.name, district: latest.customer.location.district, lastOrderAt: latest.createdAt } },
    { upsert: true },
  );
}

export async function isBlockedPhone(phone: string): Promise<boolean> {
  await connectMongoose();
  return (await CustomerModel.exists({ phone, tags: "blocked" })) !== null;
}
