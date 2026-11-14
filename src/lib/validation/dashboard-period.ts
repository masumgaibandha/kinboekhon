import { z } from "zod";

import { dhakaDay, dhakaDayStart, dhakaMonthStart, dhakaWeekStart } from "@/lib/dates";

export const PERIODS = ["today", "week", "month", "all"] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  all: "All time",
};

// A missing or bad value in the URL shows today.
const periodSchema = z.enum(PERIODS).catch("today");

export function readPeriod(value: string | string[] | undefined): Period {
  return periodSchema.parse(Array.isArray(value) ? value[0] : value);
}

// First moment of the period in Dhaka time, or null for all time.
export function periodStart(period: Period, now: Date): Date | null {
  if (period === "today") return dhakaDayStart(dhakaDay(now));
  if (period === "week") return dhakaWeekStart(now);
  if (period === "month") return dhakaMonthStart(now);
  return null;
}
