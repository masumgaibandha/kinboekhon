import { randomBytes } from "node:crypto";

import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { nextOrderNumber } from "@/lib/orders/order-number";
import { enabledAccounts } from "@/lib/orders/payment-methods";
import { calculateOrder, deliveryChargesFrom, deliveryDiscountsFrom } from "@/lib/orders/pricing";
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
}

const METHOD_OFF = "এই পেমেন্ট পদ্ধতি এখন বন্ধ। অন্য পদ্ধতি বা ক্যাশ অন ডেলিভারি বেছে নিন।";
const DUPLICATE_TXID = "এই Transaction ID দিয়ে আগেই একটি অর্ডার হয়েছে। সঠিক Transaction ID লিখুন।";
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

export async function createOrder(input: OrderInput): Promise<CreateOrderResult> {
  await connectMongoose();
  const product = await ProductModel.findOne(
    { _id: input.productId, active: true },
    { name: 1, slug: 1, price: 1, images: { $slice: 1 } },
  ).lean<OrderProduct>();
  if (!product) return { ok: false, message: "দুঃখিত, পণ্যটি এখন পাওয়া যাচ্ছে না।" };

  const settings = await getSettings();
  const { payment } = input;
  if (payment.option !== "cod" && !enabledAccounts(settings).some((account) => account.method === payment.method)) {
    return { ok: false, message: FIX_FIELDS, fieldErrors: { paymentMethod: METHOD_OFF } };
  }

  const deliveryCharge = deliveryChargesFrom(settings)[input.deliveryArea];
  const amounts = calculateOrder(product.price, input.quantity, deliveryCharge, payment.option, deliveryDiscountsFrom(settings));
  if (payment.option !== "cod" && amounts.advanceAmount <= 0) {
    return { ok: false, message: "এই অপশনে অগ্রিম পাঠানোর কিছু নেই। ক্যাশ অন ডেলিভারি বেছে নিন।" };
  }

  // A friendly check first; the unique index on the normalized ID is the real guard.
  if (payment.option !== "cod" && (await OrderModel.exists({ "payment.transactionIdNormalized": payment.transactionIdNormalized }))) {
    return duplicateTransaction();
  }

  const orderNumber = await nextOrderNumber();
  // 12 random bytes give 16 URL-safe characters, so thank-you links cannot be guessed.
  const publicId = randomBytes(12).toString("base64url");

  try {
    await OrderModel.create({
      orderNumber,
      publicId,
      product: {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.publicId ?? null,
        price: product.price,
      },
      quantity: input.quantity,
      subtotal: amounts.subtotal,
      deliveryArea: input.deliveryArea,
      deliveryCharge: amounts.deliveryCharge,
      deliveryDiscount: amounts.deliveryDiscount,
      total: amounts.total,
      customer: { name: input.name, phone: input.phone, address: input.address, location: input.location },
      status: "pending",
      statusHistory: [{ kind: "status", status: "pending", at: new Date(), note: "" }],
      payment: paymentFields(payment, amounts.advanceAmount, amounts.dueOnDelivery),
    });
  } catch (error) {
    if (isDuplicateTransaction(error)) return duplicateTransaction();
    throw error;
  }

  return { ok: true, publicId };
}
