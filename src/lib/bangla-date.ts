const dayFormat = new Intl.DateTimeFormat("bn-BD-u-nu-latn", { timeZone: "Asia/Dhaka", day: "numeric", month: "long" });
const timeFormat = new Intl.DateTimeFormat("bn-BD-u-nu-latn", { timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit" });

// Dhaka time for customers: Bangla month, English digits, like "15 নভেম্বর, 8:10 PM".
export function formatBanglaDateTime(iso: string): string {
  const date = new Date(iso);
  return `${dayFormat.format(date)}, ${timeFormat.format(date)}`;
}
