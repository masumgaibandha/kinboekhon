const SHOWN_AT_KEY = "ke_help_popup_at";
const ORDER_SUBMITTED_KEY = "ke_order_submitted";
const DAY_MS = 24 * 60 * 60 * 1000;

// Kept in memory too, for browsers that block storage.
let orderSubmitted = false;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function markOrderSubmitted() {
  orderSubmitted = true;
  write(ORDER_SUBMITTED_KEY, "1");
}

export function markHelpPopupShown() {
  write(SHOWN_AT_KEY, String(Date.now()));
}

// Once a day per visitor, never after this browser submitted the order form.
export function canShowHelpPopup(): boolean {
  if (orderSubmitted || read(ORDER_SUBMITTED_KEY)) return false;
  const shownAt = Number(read(SHOWN_AT_KEY));
  return !(shownAt > 0 && Date.now() - shownAt < DAY_MS);
}
