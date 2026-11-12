import { randomBytes } from "node:crypto";

import type { Types } from "mongoose";

import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { nextOrderNumber } from "@/lib/orders/order-number";
import { calculateOrder, deliveryChargesFrom } from "@/lib/orders/pricing";
import type { ProductImage } from "@/lib/product-images";
import { getSettings } from "@/lib/settings";
import type { OrderInput } from "@/lib/validation/order";

export type CreateOrderResult = { ok: true; publicId: string } | { ok: false; message: string };

interface OrderProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  images?: ProductImage[];
}

export async function createOrder(input: OrderInput): Promise<CreateOrderResult> {
  await connectMongoose();
  const product = await ProductModel.findOne(
    { _id: input.productId, active: true },
    { name: 1, slug: 1, price: 1, images: { $slice: 1 } },
  ).lean<OrderProduct>();
  if (!product) return { ok: false, message: "দুঃখিত, পণ্যটি এখন পাওয়া যাচ্ছে না।" };

  const settings = await getSettings();
  const deliveryCharge = deliveryChargesFrom(settings)[input.deliveryArea];
  const amounts = calculateOrder(product.price, input.quantity, deliveryCharge);
  const orderNumber = await nextOrderNumber();
  // 12 random bytes give 16 URL-safe characters, so thank-you links cannot be guessed.
  const publicId = randomBytes(12).toString("base64url");

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
    payment: {
      option: "cod",
      method: "cod",
      status: "cod",
      advanceAmount: amounts.advanceAmount,
      dueOnDelivery: amounts.dueOnDelivery,
    },
  });

  return { ok: true, publicId };
}
