import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { SmsLogModel } from "@/lib/models/SmsLog";
import { DAILY_SMS_LIMIT, deliverSms } from "@/lib/sms/deliver";
import { smsLink } from "@/lib/sms/providers";
import { TEST_SMS_TEXT } from "@/lib/sms/templates";

const TEST_ORDER = "TEST";
const TEST_ONCE_KEY = `${TEST_ORDER}:test`;

export async function testSmsSent(): Promise<boolean> {
  await connectMongoose();
  return (await SmsLogModel.exists({ onceKey: TEST_ONCE_KEY })) !== null;
}

// One test SMS to the owner's phone, only on the live site with SMS connected.
export async function sendTestSms(phone: string): Promise<AdminActionResult> {
  if (!smsLink().connected) return adminFail("SMS is not connected, so no test SMS is sent.");
  if (await testSmsSent()) return adminFail("The test SMS was already sent.");
  const outcome = await deliverSms({ orderNumber: TEST_ORDER, phone, template: "test", text: TEST_SMS_TEXT, blocked: false });
  switch (outcome) {
    case "sent":
      return { ok: true, message: "Test SMS sent. Check your phone." };
    case "duplicate":
      return adminFail("The test SMS was already sent.");
    case "limit":
      return adminFail(`This phone already got ${DAILY_SMS_LIMIT} SMS today. Not sent.`);
    default:
      return adminFail("The SMS provider did not take it. See the SMS log.");
  }
}
