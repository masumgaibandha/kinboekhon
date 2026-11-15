import { Money } from "@/components/ui/Money";

interface PriceTagProps {
  price: number;
  size?: "md" | "lg";
}

const SIZES = {
  md: "text-lg",
  lg: "text-[32px] leading-none",
};

export function PriceTag({ price, size = "md" }: PriceTagProps) {
  return (
    <p className={`font-bold text-brand ${SIZES[size]}`}>
      <Money amount={price} bold />
    </p>
  );
}
