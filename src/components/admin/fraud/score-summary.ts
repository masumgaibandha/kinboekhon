import type { CourierScore } from "@/lib/fraud/providers/types";
import { isNewCustomer } from "@/lib/fraud/score-risk";

const percent = (value: number | null) => (value === null ? "-" : `${Math.round(value)}%`);

// One Bangla line for a courier score, for example "ডেলিভারি সফল 100% · বাতিল 0% · 25+ পার্সেল · রিপোর্ট 0".
export function scoreSummary(score: CourierScore): string {
  if (isNewCustomer(score) && score.totalReports === 0 && !score.doubtfulReports) return "নতুন কাস্টমার";
  const parts = [
    `ডেলিভারি সফল ${percent(score.deliveryRatio)}`,
    `বাতিল ${percent(score.cancellationRatio)}`,
    score.volumeRange ? `${score.volumeRange} পার্সেল` : `পার্সেল ${score.volumeBand || "-"}`,
    `রিপোর্ট ${score.totalReports}`,
  ];
  if (score.doubtfulReports) parts.push("সন্দেহজনক রিপোর্ট আছে");
  if (score.score !== null) parts.push(`স্কোর ${score.score}`);
  if (score.level) parts.push(`লেভেল ${score.level}`);
  return parts.join(" · ");
}
