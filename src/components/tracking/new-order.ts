const NEW_ORDER_KEY = "ke_new_order";

// Set by the order form right before it opens the thank-you page.
export function markNewOrder(publicId: string) {
  try {
    sessionStorage.setItem(NEW_ORDER_KEY, publicId);
  } catch {}
}

// True only once per placed order, so a refresh or a later visit sends no second Purchase.
export function takeNewOrder(publicId: string): boolean {
  try {
    if (sessionStorage.getItem(NEW_ORDER_KEY) !== publicId) return false;
    sessionStorage.removeItem(NEW_ORDER_KEY);
    return true;
  } catch {
    return false;
  }
}
