export interface PathaoConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId: number;
}

// Normal delivery of a parcel (Pathao's codes).
export const DELIVERY_TYPE_NORMAL = 48;
export const ITEM_TYPE_PARCEL = 2;
export const MIN_WEIGHT_KG = 0.5;
export const MAX_WEIGHT_KG = 10;

// Every webhook reply must carry this header and value (Pathao webhook docs).
export const WEBHOOK_REPLY_HEADER = "X-Pathao-Merchant-Webhook-Integration-Secret";
export const WEBHOOK_REPLY_VALUE = "f3992ecc-59da-4cbe-a049-a13da2018d51";

export const NOT_CONNECTED = "Pathao is not connected. Set the PATHAO_ variables.";

// Null until every Pathao variable is set.
export function pathaoConfig(): PathaoConfig | null {
  const env = process.env;
  const storeId = Number(env.PATHAO_STORE_ID);
  if (
    !env.PATHAO_BASE_URL ||
    !env.PATHAO_CLIENT_ID ||
    !env.PATHAO_CLIENT_SECRET ||
    !env.PATHAO_USERNAME ||
    !env.PATHAO_PASSWORD ||
    !Number.isInteger(storeId) ||
    storeId <= 0
  ) {
    return null;
  }
  return {
    baseUrl: env.PATHAO_BASE_URL.replace(/\/+$/, ""),
    clientId: env.PATHAO_CLIENT_ID,
    clientSecret: env.PATHAO_CLIENT_SECRET,
    username: env.PATHAO_USERNAME,
    password: env.PATHAO_PASSWORD,
    storeId,
  };
}

// Pathao's public tracking page; it asks for the customer phone.
export function trackingUrl(consignmentId: string): string {
  return `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(consignmentId)}`;
}
