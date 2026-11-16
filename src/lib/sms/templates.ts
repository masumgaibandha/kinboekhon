export const AUTO_TEMPLATES = ["received", "confirmed", "shipped", "delivered"] as const;
export type AutoTemplate = (typeof AUTO_TEMPLATES)[number];
export const SMS_TEMPLATE_KINDS = [...AUTO_TEMPLATES, "manual", "test"] as const;
export type SmsTemplateKind = (typeof SMS_TEMPLATE_KINDS)[number];

export const SMS_TEMPLATE_LABELS: Record<SmsTemplateKind, string> = {
  received: "Order received",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  manual: "Manual",
  test: "Test SMS",
};

export const SMS_TEMPLATE_HINTS: Record<AutoTemplate, string> = {
  received: "Sent when an order is placed. {track} is the order tracking page.",
  confirmed: "Sent when the order becomes Confirmed (after the call or an approved advance payment).",
  shipped: "Sent when the order becomes Shipped. {track} is the Pathao tracking link (the order tracking page if it was not sent through Pathao).",
  delivered: "Sent when the order becomes Delivered.",
};

export const SMS_PLACEHOLDERS = ["name", "order", "amount", "track"] as const;
export type SmsValues = Record<(typeof SMS_PLACEHOLDERS)[number], string>;

// Each fits one Bangla SMS part (70 characters) with a typical order number and amount.
export const DEFAULT_SMS_TEXTS: Record<AutoTemplate, string> = {
  received: "কিনবো এখন: অর্ডার {order} পেয়েছি, মোট ৳{amount}। শীঘ্রই কল করবো।",
  confirmed: "কিনবো এখন: অর্ডার {order} কনফার্ম হয়েছে, শীঘ্রই পাঠানো হবে।",
  shipped: "কিনবো এখন: অর্ডার {order} কুরিয়ারে পাঠানো হয়েছে, শীঘ্রই পৌঁছাবে।",
  delivered: "কিনবো এখন: অর্ডার {order} ডেলিভারি হয়েছে। কেনাকাটার জন্য ধন্যবাদ!",
};

export const TEST_SMS_TEXT = "কিনবো এখন: টেস্ট SMS। SMS চালু আছে।";

const PLACEHOLDER = /\{(\w+)\}/g;

// Placeholder names in the text that are not one of SMS_PLACEHOLDERS.
export function unknownPlaceholders(text: string): string[] {
  const known: readonly string[] = SMS_PLACEHOLDERS;
  return [...text.matchAll(PLACEHOLDER)].map((match) => match[1]).filter((name) => !known.includes(name));
}

export function renderSms(text: string, values: SmsValues): string {
  return text.replace(PLACEHOLDER, (whole, name: string) => (name in values ? values[name as keyof SmsValues] : whole));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function orderTrackUrl(publicId: string): string {
  return `${SITE_URL}/track?ref=${publicId}`;
}

// Typical values, so the admin sees about how long a real SMS will be.
export function sampleSmsValues(template: AutoTemplate): SmsValues {
  return {
    name: "রহিম উদ্দিন",
    order: "KE10001",
    amount: "1,290",
    track:
      template === "shipped"
        ? "https://merchant.pathao.com/tracking?consignment_id=DL121224VS8TTJ"
        : orderTrackUrl("AbCdEfGhIjKlMnOp"),
  };
}
