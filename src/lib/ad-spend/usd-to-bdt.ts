// Whole taka for a dollar amount, worked out in whole cents so a rate like 122.35 adds no float error.
export function usdToBdt(amountUsd: number, usdRate: number): number {
  const cents = Math.round(amountUsd * 100);
  const rateCents = Math.round(usdRate * 100);
  return Math.round((cents * rateCents) / 10000);
}
