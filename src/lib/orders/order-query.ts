import { connectMongoose } from "@/lib/db";
import { dhakaDayEnd, dhakaDayStart } from "@/lib/dates";
import { CustomerModel } from "@/lib/models/Customer";
import { normalizePhone } from "@/lib/phone";
import { escapeRegex } from "@/lib/regex";
import type { OrderFilters } from "@/lib/validation/order-filters";

// "KE10001" or "10001" finds an order number, a number starting with 0 finds phones by prefix, anything else a name.
function searchQuery(q: string): Record<string, unknown> {
  const compact = normalizePhone(q);
  if (/^0\d{1,10}$/.test(compact)) return { "customer.phone": { $regex: `^${compact}` } };
  const orderNumber = /^(?:KE)?([1-9]\d{4,8})$/i.exec(compact);
  if (orderNumber) return { orderNumber: `KE${orderNumber[1]}` };
  return { "customer.name": { $regex: escapeRegex(q), $options: "i" } };
}

// The MongoDB filter for the orders list and its CSV export.
export async function orderListQuery(filters: OrderFilters): Promise<Record<string, unknown>> {
  const query: Record<string, unknown> = filters.q ? searchQuery(filters.q) : {};
  if (filters.status) query.status = filters.status;
  if (filters.method) query["payment.method"] = filters.method;
  if (filters.payment) query["payment.status"] = filters.payment;
  if (filters.call) query["lastCall.outcome"] = filters.call === "none" ? null : filters.call;
  if (filters.product) query["product.productId"] = filters.product;

  const from = filters.from ? dhakaDayStart(filters.from) : null;
  const to = filters.to ? dhakaDayEnd(filters.to) : null;
  if (from || to) query.createdAt = { ...(from && { $gte: from }), ...(to && { $lt: to }) };

  // Risk is kept per phone on the customer record, so the filter becomes a list of phones.
  if (filters.risk) {
    await connectMongoose();
    const phones = await CustomerModel.distinct("phone", { "risk.label": filters.risk });
    query.$and = [{ "customer.phone": { $in: phones } }];
  }
  return query;
}
