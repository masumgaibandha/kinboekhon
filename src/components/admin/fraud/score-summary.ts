import type { CourierScore } from "@/lib/fraud/providers/types";
import { isNewCustomer } from "@/lib/fraud/score-risk";

const percent = (value: number | null) => (value === null ? "-" : `${Math.round(value)}%`);

// A courier score in the table's Delivered, Cancelled / returned and Total columns.
export function scoreCells(score: CourierScore): string[] {
  return [percent(score.deliveryRatio), percent(score.cancellationRatio), score.volumeRange || score.volumeBand || "-"];
}

// The rest of a courier score as one Bangla line, for example "রিপোর্ট 0 · স্কোর 85".
export function scoreNotes(score: CourierScore): string {
  if (isNewCustomer(score) && score.totalReports === 0 && !score.doubtfulReports) return "নতুন কাস্টমার";
  const parts = [`রিপোর্ট ${score.totalReports}`];
  if (score.doubtfulReports) parts.push("সন্দেহজনক রিপোর্ট আছে");
  if (score.score !== null) parts.push(`স্কোর ${score.score}`);
  if (score.level) parts.push(`লেভেল ${score.level}`);
  return parts.join(" · ");
}
