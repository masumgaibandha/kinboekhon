const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => BANGLA_DIGITS[Number(digit)]);
}

// Lakh grouping as used in Bangladesh, for example ৳১,২৯০ and ৳১,০০,০০০.
export function formatTaka(amount: number): string {
  return `৳${toBanglaDigits(amount.toLocaleString("en-IN"))}`;
}

// Rounded down, so the badge never shows more than the real discount.
export function discountPercent(price: number, oldPrice: number | null): number {
  if (oldPrice === null || oldPrice <= price) return 0;
  return Math.floor(((oldPrice - price) * 100) / oldPrice);
}
