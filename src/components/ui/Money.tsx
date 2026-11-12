import { TakaIcon } from "@/components/ui/TakaIcon";

interface MoneyProps {
  amount: number;
  bold?: boolean;
}

// Stroke widths that match the digit stems of the system font at weight 400 and 700.
const STROKE = { regular: 1.3, bold: 2.8 };

export function Money({ amount, bold = false }: MoneyProps) {
  return (
    <span className="whitespace-nowrap">
      <TakaIcon strokeWidth={bold ? STROKE.bold : STROKE.regular} />
      <span className="sr-only">টাকা</span>
      <span className="ml-[0.15em]">{amount.toLocaleString("en-IN")}</span>
    </span>
  );
}
