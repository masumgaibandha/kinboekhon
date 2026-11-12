// Personal accounts take Send Money, merchant accounts take Payment. Agent accounts are not offered.
export const ACCOUNT_TYPES = ["personal", "merchant"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export function isAccountType(value: unknown): value is AccountType {
  return (ACCOUNT_TYPES as readonly unknown[]).includes(value);
}
