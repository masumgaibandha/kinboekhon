// Bangladesh has no daylight saving, so Dhaka time is always UTC+6.
const DHAKA_OFFSET = "+06:00";
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDhakaDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

// Start of a Dhaka calendar day ("YYYY-MM-DD") as a UTC Date, or null when the text is not a real day.
export function dhakaDayStart(day: string): Date | null {
  if (!DAY_PATTERN.test(day)) return null;
  const date = new Date(`${day}T00:00:00${DHAKA_OFFSET}`);
  // Rejects days such as 2026-02-30, which would roll over into the next month.
  return !Number.isNaN(date.getTime()) && dhakaDay(date) === day ? date : null;
}

// Start of the next Dhaka day, used as an exclusive end.
export function dhakaDayEnd(day: string): Date | null {
  const start = dhakaDayStart(day);
  return start ? new Date(start.getTime() + 24 * 60 * 60 * 1000) : null;
}

// "YYYY-MM-DD" of a Date in Dhaka time.
export function dhakaDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(date);
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Start of the Dhaka week that holds the date; the week starts on Saturday.
export function dhakaWeekStart(date: Date): Date {
  const day = dhakaDay(date);
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  const daysSinceSaturday = (weekday + 1) % 7;
  return new Date(new Date(`${day}T00:00:00${DHAKA_OFFSET}`).getTime() - daysSinceSaturday * DAY_MS);
}

// Start of the Dhaka calendar month that holds the date.
export function dhakaMonthStart(date: Date): Date {
  return new Date(`${dhakaDay(date).slice(0, 8)}01T00:00:00${DHAKA_OFFSET}`);
}

// Time passed since a moment, short: "45 min", "3 h 5 min", "2 d 4 h".
export function formatAge(from: Date, now: Date): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return hours > 0 ? `${days} d ${hours} h` : `${days} d`;
  if (hours > 0) return minutes % 60 > 0 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
  return `${minutes} min`;
}
