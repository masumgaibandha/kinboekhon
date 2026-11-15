import { isValidObjectId, type Types } from "mongoose";

import { dhakaDay } from "@/lib/dates";
import { connectMongoose } from "@/lib/db";
import { AdSpendModel, type AdSpendDocument } from "@/lib/models/AdSpend";
import { productChoices } from "@/lib/products";
import type { AdSpendInput } from "@/lib/validation/ad-spend";
import { rangeFilter } from "@/lib/validation/report-range";

export interface AdSpendEntry {
  id: string;
  day: string;
  productId: string;
  productName: string;
  amountUsd: number;
  usdRate: number;
  amountBdt: number;
}

type AdSpendRow = AdSpendDocument & { _id: Types.ObjectId; updatedAt?: Date };

function toEntry(row: AdSpendRow, names: Map<string, string>): AdSpendEntry {
  const productId = String(row.productId);
  return {
    id: String(row._id),
    day: dhakaDay(row.day),
    productId,
    productName: names.get(productId) ?? "Removed product",
    amountUsd: row.amountUsd,
    usdRate: row.usdRate,
    amountBdt: row.amountBdt,
  };
}

const namesOf = (products: { id: string; name: string }[]) => new Map(products.map((p) => [p.id, p.name]));

// Entries in the range, newest day first.
export async function listAdSpend(start: Date | null, end: Date | null): Promise<AdSpendEntry[]> {
  await connectMongoose();
  const day = rangeFilter(start, end);
  const [rows, products] = await Promise.all([
    AdSpendModel.find(day ? { day } : {}).sort({ day: -1, createdAt: -1 }).lean<AdSpendRow[]>(),
    productChoices(),
  ]);
  const names = namesOf(products);
  return rows.map((row) => toEntry(row, names));
}

export interface AdminAdSpend {
  entry: AdSpendEntry;
  // The values the edit form starts with, in the shape the form check gives.
  values: AdSpendInput;
  version: string;
}

export async function getAdSpendForAdmin(id: string): Promise<AdminAdSpend | null> {
  if (!isValidObjectId(id)) return null;
  await connectMongoose();
  const [row, products] = await Promise.all([AdSpendModel.findById(id).lean<AdSpendRow>(), productChoices()]);
  if (!row) return null;
  const entry = toEntry(row, namesOf(products));
  return {
    entry,
    values: { day: entry.day, productId: entry.productId, amountUsd: entry.amountUsd, usdRate: entry.usdRate },
    version: row.updatedAt?.toISOString() ?? "",
  };
}
