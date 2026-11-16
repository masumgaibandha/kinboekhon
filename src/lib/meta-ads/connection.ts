export interface MetaAdsConnection {
  accountId: string;
  token: string;
}

export type MetaAdsLink = { connected: true; connection: MetaAdsConnection } | { connected: false; reason: string };

// Read-only access: a system user token with ads_read only, for one ad account.
export function metaAdsLink(): MetaAdsLink {
  const accountId = process.env.META_ADS_ACCOUNT_ID?.trim() ?? "";
  const token = process.env.META_ADS_TOKEN?.trim() ?? "";
  if (!accountId || !token) return { connected: false, reason: "Set META_ADS_ACCOUNT_ID and META_ADS_TOKEN to connect." };
  if (!/^act_\d{1,30}$/.test(accountId)) return { connected: false, reason: "META_ADS_ACCOUNT_ID must look like act_1234567890." };
  return { connected: true, connection: { accountId, token } };
}
