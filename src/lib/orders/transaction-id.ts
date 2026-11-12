// Uppercase with every space removed, so "ab12 cd34" and "AB12CD34" count as the same Transaction ID.
export function normalizeTransactionId(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export const TRANSACTION_ID_PATTERN = /^[A-Z0-9-]{6,30}$/;
