import { TRY_AGAIN, adminFail, type AdminActionResult } from "@/lib/admin-result";
import { usdToBdt } from "@/lib/ad-spend/usd-to-bdt";
import { changedFields } from "@/lib/changed-fields";
import { dhakaDayStart } from "@/lib/dates";
import { connectMongoose } from "@/lib/db";
import { AdSpendModel } from "@/lib/models/AdSpend";
import { ProductModel } from "@/lib/models/Product";
import type { AdSpendInput } from "@/lib/validation/ad-spend";

export const AD_SPEND_GONE = "This ad spend entry no longer exists. Reload the page.";
const TAKEN = "This product already has an entry for that day. Edit it instead.";
const NO_PRODUCT = "Choose a product.";

const isDuplicateKey = (error: unknown) => (error as { code?: unknown } | null)?.code === 11000;

async function productMissing(productId: string): Promise<boolean> {
  return (await ProductModel.exists({ _id: productId })) === null;
}

// Runs a write; a second entry for the same product and day is refused with a field message.
async function guard(write: () => Promise<AdminActionResult>): Promise<AdminActionResult> {
  try {
    await connectMongoose();
    return await write();
  } catch (error) {
    if (isDuplicateKey(error)) return adminFail(TAKEN, { day: TAKEN });
    return adminFail(TRY_AGAIN);
  }
}

export function createAdSpendEntry(input: AdSpendInput): Promise<AdminActionResult> {
  return guard(async () => {
    if (await productMissing(input.productId)) return adminFail(NO_PRODUCT, { productId: NO_PRODUCT });
    await AdSpendModel.create({
      day: dhakaDayStart(input.day) ?? undefined,
      productId: input.productId,
      amountUsd: input.amountUsd,
      usdRate: input.usdRate,
      amountBdt: usdToBdt(input.amountUsd, input.usdRate),
    });
    return { ok: true, message: "Ad spend added." };
  });
}

// Writes only what the admin changed; the dollar amount, rate and taka amount always move together.
export function updateAdSpendEntry(id: string, input: AdSpendInput, initial: object): Promise<AdminActionResult> {
  return guard(async () => {
    const changes = changedFields(input, initial);
    if (Object.keys(changes).length === 0) return { ok: true, message: "No changes to save." };
    if ("productId" in changes && (await productMissing(input.productId))) {
      return adminFail(NO_PRODUCT, { productId: NO_PRODUCT });
    }

    const set: Record<string, unknown> = {};
    if ("day" in changes) set.day = dhakaDayStart(input.day) ?? undefined;
    if ("productId" in changes) set.productId = input.productId;
    if ("amountUsd" in changes || "usdRate" in changes) {
      set.amountUsd = input.amountUsd;
      set.usdRate = input.usdRate;
      set.amountBdt = usdToBdt(input.amountUsd, input.usdRate);
    }

    const result = await AdSpendModel.updateOne({ _id: id }, { $set: set });
    if (result.matchedCount === 0) return adminFail(AD_SPEND_GONE);
    return { ok: true, message: "Ad spend saved." };
  });
}

export function deleteAdSpendEntry(id: string): Promise<AdminActionResult> {
  return guard(async () => {
    const result = await AdSpendModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) return adminFail(AD_SPEND_GONE);
    return { ok: true, message: "Ad spend deleted." };
  });
}
