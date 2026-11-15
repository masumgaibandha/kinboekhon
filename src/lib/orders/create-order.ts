import { randomBytes } from "node:crypto";

import type { Types } from "mongoose";

import { isBlockedPhone, syncCustomer } from "@/lib/customers/sync-customer";
import { connectMongoose } from "@/lib/db";
import type { AdTracking } from "@/lib/meta/ad-tracking";
import { OrderModel, type OrderDocument, type OrderTracking } from "@/lib/models/Order";
import { deleteDraftsForOrder } from "@/lib/drafts/save-draft";
import { checkRepeatOrder } from "@/lib/orders/duplicate-check";
import { ProductModel } from "@/lib/models/Product";
import { nextOrderNumber } from "@/lib/orders/order-number";
import { enabledAccounts } from "@/lib/orders/payment-methods";
import type { OrderItem } from "@/lib/orders/order-items";
import { calculateOrder, deliveryChargeFor, itemsSubtotal } from "@/lib/orders/pricing";
import type { ProductImage } from "@/lib/product-images";
import { getSettings } from "@/lib/settings";
import type { OrderInput } from "@/lib/validation/order";
import type { PaymentInput } from "@/lib/validation/order-payment";

export type CreateOrderResult =
  | { ok: true; publicId: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

interface OrderProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  images?: ProductImage[];
  stock?: number;
}

const METHOD_OFF = "এই পেমেন্ট পদ্ধতি এখন বন্ধ। অন্য পদ্ধতি বা ক্যাশ অন ডেলিভারি বেছে নিন।";
const DUPLICATE_TXID = "এই Transaction ID দিয়ে আগেই একটি অর্ডার হয়েছে। সঠিক Transaction ID লিখুন।";
const EXTRA_GONE = "দুঃখিত, সঙ্গে নেওয়া একটি পণ্য এখন পাওয়া যাচ্ছে না। সেটি বাদ দিয়ে আবার চেষ্টা করুন।";
const FIX_FIELDS = "চিহ্নিত ঘরগুলো ঠিক করুন।";

const duplicateTransaction = (): CreateOrderResult => ({
  ok: false,
  message: FIX_FIELDS,
  fieldErrors: { transactionId: DUPLICATE_TXID },
});

function isDuplicateTransaction(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error) || error.code !== 11000) return false;
  return "keyPattern" in error && typeof error.keyPattern === "object" && error.keyPattern !== null
    ? "payment.transactionIdNormalized" in error.keyPattern
    : false;
}

function paymentFields(payment: PaymentInput, advanceAmount: number, dueOnDelivery: number): OrderDocument["payment"] {
  if (payment.option === "cod") return { option: "cod", method: "cod", status: "cod", advanceAmount, dueOnDelivery };
  const { option, method, senderNumber, transactionId, transactionIdNormalized } = payment;
  return { option, method, status: "submitted", advanceAmount, dueOnDelivery, senderNumber, transactionId, transactionIdNormalized };
}

// The request facts saved with the order; the Turnstile result is "passed" or "unverified" here.
export type OrderRequestInfo = Required<Pick<OrderTracking, "ip" | "ipHash" | "userAgent" | "turnstile">> & AdTracking;

export async function createOrder(input: OrderInput, request: OrderRequestInfo): Promise<CreateOrderResult> {
  await connectMongoose();
  const lines = [{ productId: input.productId, quantity: input.quantity }, ...input.extras];
  const found = await ProductModel.find(
    { _id: { $in: lines.map((line) => line.productId) }, active: true },
    { name: 1, slug: 1, price: 1, stock: 1, images: { $slice: 1 } },
  ).lean<OrderProduct[]>();
  const byId = new Map(found.map((item) => [String(item._id), item]));
  const product = byId.get(input.productId);
  if (!product) return { ok: false, message: "দুঃখিত, পণ্যটি এখন পাওয়া যাচ্ছে না।" };

  const settings = await getSettings();
  const items: OrderItem[] = [];
  for (const line of lines) {
    const item = byId.get(line.productId);
    if (!item) return { ok: false, message: EXTRA_GONE };
    if (settings.hideOrderWhenOutOfStock && (item.stock ?? 0) <= 0) {
      return { ok: false, message: item === product ? "দুঃখিত, পণ্যটির স্টক এখন শেষ।" : `দুঃখিত, ${item.name} এর স্টক এখন শেষ। সেটি বাদ দিয়ে আবার চেষ্টা করুন।` };
    }
    items.push({
      productId: item._id,
      name: item.name,
      slug: item.slug,
      image: item.images?.[0]?.publicId ?? null,
      price: item.price,
      quantity: line.quantity,
    });
  }

  const repeat = await checkRepeatOrder(input.phone, product._id, settings);
  if (repeat) return { ok: false, message: repeat };

  const { payment } = input;
  if (payment.option !== "cod" && !enabledAccounts(settings).some((account) => account.method === payment.method)) {
    return { ok: false, message: FIX_FIELDS, fieldErrors: { paymentMethod: METHOD_OFF } };
  }

  const deliveryCharge = deliveryChargeFor(input.location.kind === "dhaka_city", settings);
  const amounts = calculateOrder(itemsSubtotal(items), deliveryCharge, payment.option, settings);
  if (payment.option !== "cod" && amounts.advanceAmount <= 0) {
    return { ok: false, message: "এই অপশনে অগ্রিম পাঠানোর কিছু নেই। ক্যাশ অন ডেলিভারি বেছে নিন।" };
  }

  // A friendly check first; the unique index on the normalized ID is the real guard.
  if (payment.option !== "cod" && (await OrderModel.exists({ "payment.transactionIdNormalized": payment.transactionIdNormalized }))) {
    return duplicateTransaction();
  }

  // A blocked customer's order is still taken, flagged for the admin.
  const customerBlocked = await isBlockedPhone(input.phone);
  const orderNumber = await nextOrderNumber();
  // 12 random bytes give 16 URL-safe characters, so thank-you links cannot be guessed.
  const publicId = randomBytes(12).toString("base64url");

  try {
    await OrderModel.create({
      orderNumber,
      publicId,
      items,
      subtotal: amounts.subtotal,
      deliveryCharge: amounts.deliveryCharge,
      discount: amounts.discount,
      total: amounts.total,
      customer: { name: input.name, phone: input.phone, address: input.address, location: input.location },
      status: "pending",
      statusHistory: [{ kind: "status", status: "pending", at: new Date(), note: "" }],
      payment: paymentFields(payment, amounts.advanceAmount, amounts.dueOnDelivery),
      customerBlocked,
      tracking: request,
      capiPurchase: { status: "pending" },
    });
  } catch (error) {
    if (isDuplicateTransaction(error)) return duplicateTransaction();
    throw error;
  }

  // The order is saved; a failed draft cleanup or customer update must not turn it into an error.
  try {
    await deleteDraftsForOrder(input.draftKey, input.phone, product._id);
  } catch {}
  try {
    await syncCustomer(input.phone);
  } catch {}

  return { ok: true, publicId };
}
