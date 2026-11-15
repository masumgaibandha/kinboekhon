import { z } from "zod";

import { dhakaDayEnd, dhakaDayStart } from "@/lib/dates";
import { periodStart } from "@/lib/validation/dashboard-period";

export const RANGE_PERIODS = ["today", "week", "month", "custom"] as const;
export type RangePeriod = (typeof RANGE_PERIODS)[number];

export const RANGE_LABELS: Record<RangePeriod, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  custom: "Custom",
};

export interface ReportRange {
  period: RangePeriod;
  // "YYYY-MM-DD" Dhaka days of a custom range, "" when open.
  from: string;
  to: string;
  start: Date | null;
  end: Date | null;
}

const day = z
  .string()
  .refine((value) => value === "" || dhakaDayStart(value) !== null)
  .catch("");

type SearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

// A missing or bad period shows `fallback`; a bad day is dropped, and a custom range given backwards is turned round.
export function readReportRange(params: SearchParams, fallback: RangePeriod, now: Date): ReportRange {
  const period = z.enum(RANGE_PERIODS).catch(fallback).parse(one(params.period) || fallback);
  if (period !== "custom") return { period, from: "", to: "", start: periodStart(period, now), end: null };

  let from = day.parse(one(params.from));
  let to = day.parse(one(params.to));
  if (from && to && from > to) [from, to] = [to, from];
  return { period, from, to, start: from ? dhakaDayStart(from) : null, end: to ? dhakaDayEnd(to) : null };
}

// Link to `path` for a period; the fallback period is left out of the URL.
export function rangeHref(path: string, period: RangePeriod, fallback: RangePeriod): string {
  return period === fallback ? path : `${path}?period=${period}`;
}

// Mongo filter for a date field inside [start, end); null when both sides are open.
export function rangeFilter(start: Date | null, end: Date | null): Record<string, Date> | null {
  if (!start && !end) return null;
  return { ...(start ? { $gte: start } : {}), ...(end ? { $lt: end } : {}) };
}
