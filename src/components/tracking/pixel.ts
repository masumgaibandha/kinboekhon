declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// The base snippet fires this once fbq exists, so events from early effects are not lost.
export const PIXEL_READY_EVENT = "ke:pixel-ready";

export interface PixelProductData {
  content_ids: string[];
  content_name?: string;
  content_type: "product";
  currency: "BDT";
  contents?: { id: string; quantity: number; item_price: number }[];
  value: number;
  num_items?: number;
}

export function productData(productId: string, value: number, numItems?: number, name?: string): PixelProductData {
  return { content_ids: [productId], content_name: name, content_type: "product", currency: "BDT", value, num_items: numItems };
}

export function trackPixel(event: string, data?: PixelProductData, eventId?: string) {
  const args: unknown[] = ["track", event, data ?? {}];
  if (eventId) args.push({ eventID: eventId });
  const send = () => window.fbq?.(...args);
  if (window.fbq) send();
  else window.addEventListener(PIXEL_READY_EVENT, send, { once: true });
}

export function randomEventId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
