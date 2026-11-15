import type { PipelineStage } from "mongoose";

import { STATS_FIELDS, type CustomerStats } from "@/lib/customers/customer-stats";
import { sortedTags, type CustomerTag } from "@/lib/customers/tags";
import { connectMongoose } from "@/lib/db";
import { CustomerModel } from "@/lib/models/Customer";
import { OrderModel } from "@/lib/models/Order";
import { normalizePhone } from "@/lib/phone";
import { escapeRegex } from "@/lib/regex";
import { CUSTOMERS_PER_PAGE, type CustomerFilters, type CustomerSort } from "@/lib/validation/customer-filters";

export interface CustomerListItem extends CustomerStats {
  phone: string;
  name: string;
  district: string;
  tags: CustomerTag[];
  lastOrderAt: Date;
}

export interface CustomerListPage {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageCount: number;
}

interface ListRow extends Omit<CustomerListItem, "orders"> {
  orderCount: number;
}

const SORTS: Record<CustomerSort, Record<string, 1 | -1>> = {
  recent: { lastOrderAt: -1, _id: -1 },
  orders: { orderCount: -1, lastOrderAt: -1, _id: -1 },
  spent: { spent: -1, lastOrderAt: -1, _id: -1 },
};

// A number starting with 0 finds phones by prefix (Bangla digits and +880 work), anything else a name.
function buildQuery(filters: CustomerFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filters.q) {
    const compact = normalizePhone(filters.q);
    if (/^0\d{0,10}$/.test(compact)) query.phone = { $regex: `^${compact}` };
    else query.name = { $regex: escapeRegex(filters.q), $options: "i" };
  }
  if (filters.tag) query.tags = filters.tag;
  return query;
}

export async function listCustomersForAdmin(filters: CustomerFilters): Promise<CustomerListPage> {
  await connectMongoose();
  const query = buildQuery(filters);
  const total = await CustomerModel.countDocuments(query);
  const pageCount = Math.max(1, Math.ceil(total / CUSTOMERS_PER_PAGE));
  const page = Math.min(filters.page, pageCount);

  const withStats: PipelineStage[] = [
    {
      $lookup: {
        from: OrderModel.collection.name,
        localField: "phone",
        foreignField: "customer.phone",
        as: "orders",
        pipeline: [{ $project: { _id: 0, status: 1, total: 1 } }],
      },
    },
    { $addFields: STATS_FIELDS },
  ];
  const paging: PipelineStage[] = [
    { $sort: SORTS[filters.sort] },
    { $skip: (page - 1) * CUSTOMERS_PER_PAGE },
    { $limit: CUSTOMERS_PER_PAGE },
  ];
  // Sorting by last order needs no counts, so only the shown page is counted.
  const stages = filters.sort === "recent" ? [...paging, ...withStats] : [...withStats, ...paging];

  const rows = await CustomerModel.aggregate<ListRow>([
    { $match: query },
    ...stages,
    { $project: { _id: 0, orders: 0, notes: 0, createdAt: 0, updatedAt: 0, __v: 0 } },
  ]);

  const items = rows.map(({ orderCount, tags, ...row }) => ({ ...row, tags: sortedTags(tags), orders: orderCount }));
  return { items, total, page, pageCount };
}
