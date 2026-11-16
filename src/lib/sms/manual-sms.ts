import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import { DAILY_SMS_LIMIT, deliverSms } from "@/lib/sms/deliver";

// Sends the admin's own text to the order's phone, read from the order on the server.
export async function sendManualSms(orderNumber: string, text: string): Promise<AdminActionResult> {
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { "customer.phone": 1, customerBlocked: 1 }).lean<{
    customer: { phone: string };
    customerBlocked?: boolean;
  }>();
  if (!order) return adminFail(ORDER_NOT_FOUND);

  const outcome = await deliverSms({ orderNumber, phone: order.customer.phone, template: "manual", text, blocked: order.customerBlocked === true });
  switch (outcome) {
    case "sent":
      return { ok: true, message: "SMS sent." };
    case "not_connected":
      return { ok: true, warning: true, message: "SMS not connected. The SMS was logged, not sent." };
    case "blocked":
      return adminFail("Blocked customer: no SMS is sent for this order.");
    case "limit":
      return adminFail(`This phone already got ${DAILY_SMS_LIMIT} SMS today. Not sent.`);
    default:
      return adminFail("The SMS provider did not take it. See the SMS log.");
  }
}
