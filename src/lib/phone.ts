const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

export const BD_MOBILE_PATTERN = /^01[3-9]\d{8}$/;

export function normalizePhone(raw: string): string {
  return raw
    .replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)))
    .replace(/[\s-]/g, "")
    .replace(/^\+?880/, "0");
}

// 01XXXXXXXXX to 8801XXXXXXXXX, for wa.me links.
export function toInternationalPhone(phone: string): string {
  return `88${phone}`;
}
