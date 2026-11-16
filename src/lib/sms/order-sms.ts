import { after } from "next/server";

import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import type { OrderStatus } from "@/lib/orders/enums";
import { trackingUrl } from "@/lib/pathao/config";
import { deliverSms } from "@/lib/sms/deliver";
import { getSmsSettings } from "@/lib/sms/sms-settings";
import { orderTrackUrl, renderSms, type AutoTemplate } from "@/lib/sms/templates";

type SmsOrder = Pick<OrderDocument, "publicId" | "total" | "customerBlocked" | "courier"> & {
  customer: Pick<OrderDocument["customer"], "name" | "phone">;
};

const STATUS_TEMPLATES: Partial<Record<OrderStatus, AutoTemplate>> = {
  confirmed: "confirmed",
  shipped: "shipped",
  delivered: "delivered",
};

function trackFor(template: AutoTemplate, order: SmsOrder): string {
  const consignmentId = order.courier?.consignmentId;
  return template === "shipped" && consignmentId ? trackingUrl(consignmentId) : orderTrackUrl(order.publicId);
}

// Sends one automatic SMS for an order, if its template is on.
export async function sendOrderSms(orderNumber: string, template: AutoTemplate): Promise<void> {
  const { sms } = await getSmsSettings();
  const config = sms.templates[template];
  if (!config.enabled || !config.text) return;

  await connectMongoose();
  const order = await OrderModel.findOne(
    { orderNumber },
    { publicId: 1, total: 1, customerBlocked: 1, courier: 1, "customer.name": 1, "customer.phone": 1 },
  ).lean<SmsOrder>();
  if (!order) return;

  const text = renderSms(config.text, {
    name: order.customer.name,
    order: orderNumber,
    amount: order.total.toLocaleString("en-IN"),
    track: trackFor(template, order),
  });
  await deliverSms({ orderNumber, phone: order.customer.phone, template, text, blocked: order.customerBlocked === true });
}

// Runs after the response, so an SMS never slows down or fails an order or an admin save.
export function queueOrderSms(orderNumber: string, template: AutoTemplate): void {
  after(() => sendOrderSms(orderNumber, template).catch(() => {}));
}

// The SMS for a new order status, when that status has one.
export function queueStatusSms(orderNumber: string, status: OrderStatus): void {
  const template = STATUS_TEMPLATES[status];
  if (template) queueOrderSms(orderNumber, template);
}
