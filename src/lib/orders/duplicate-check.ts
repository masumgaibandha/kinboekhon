import type { Types } from "mongoose";

import { OrderModel } from "@/lib/models/Order";
import type { Settings } from "@/lib/validation/settings";

const HOUR = 60 * 60 * 1000;
export const PHONE_ORDERS_PER_DAY = 3;

// The call line, when a support phone is set in Settings.
const callLine = (supportPhone: string, text: string) => (supportPhone ? ` ${text} ${supportPhone}।` : "");

// Same phone and same product inside the duplicate window (cancelled orders don't count): no new order.
async function findDuplicate(phone: string, productId: Types.ObjectId, windowHours: number): Promise<string | null> {
  const since = new Date(Date.now() - windowHours * HOUR);
  const existing = await OrderModel.findOne(
    { "customer.phone": phone, "product.productId": productId, createdAt: { $gte: since }, status: { $ne: "cancelled" } },
    { orderNumber: 1 },
  )
    .sort({ createdAt: -1 })
    .lean<{ orderNumber: string }>();
  return existing?.orderNumber ?? null;
}

// Returns the Bangla message that stops the order, or null when it may go ahead.
export async function checkRepeatOrder(phone: string, productId: Types.ObjectId, settings: Settings): Promise<string | null> {
  const window = settings.duplicateWindowHours;
  const duplicate = await findDuplicate(phone, productId, window);
  if (duplicate) {
    return (
      `আপনি গত ${window} ঘণ্টায় এই পণ্যটি অর্ডার করেছেন। আপনার অর্ডার নম্বর ${duplicate}।` +
      callLine(settings.supportPhone, "কিছু বদলাতে চাইলে কল করুন")
    );
  }

  // Every order from this phone in the last 24 hours counts, for all products.
  const today = await OrderModel.countDocuments({ "customer.phone": phone, createdAt: { $gte: new Date(Date.now() - 24 * HOUR) } });
  if (today >= PHONE_ORDERS_PER_DAY) {
    return (
      `এই নম্বর থেকে গত 24 ঘণ্টায় ${PHONE_ORDERS_PER_DAY}টি অর্ডার হয়েছে। আরও অর্ডার করতে চাইলে পরে চেষ্টা করুন।` +
      callLine(settings.supportPhone, "জরুরি হলে কল করুন")
    );
  }
  return null;
}
