import { RISK_LABEL_TEXT, type RiskLabel } from "@/lib/fraud/risk";

const STYLES: Record<RiskLabel, string> = {
  unknown: "bg-line text-muted",
  low: "border border-line-strong text-body",
  check: "border border-brand bg-brand-light text-brand-dark",
  high: "bg-brand text-white",
};

export function RiskBadge({ risk }: { risk: RiskLabel }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[risk]}`}>
      Risk: {RISK_LABEL_TEXT[risk]}
    </span>
  );
}
