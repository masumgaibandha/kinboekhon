import { Money } from "@/components/ui/Money";

interface PriceTagProps {
  price: number;
  size?: "md" | "lg";
  // Shows "free delivery" next to the price, on the landing page.
  freeDelivery?: boolean;
}

const SIZES = {
  md: "text-lg",
  lg: "text-[32px] leading-none",
};

export function PriceTag({ price, size = "md", freeDelivery = false }: PriceTagProps) {
  const tag = (
    <p className={`font-bold text-brand ${SIZES[size]}`}>
      <Money amount={price} bold />
    </p>
  );
  if (!freeDelivery) return tag;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {tag}
      <span className="rounded-md bg-brand-light px-2 py-1 text-sm font-semibold text-brand-dark">সারা দেশে ফ্রি ডেলিভারি</span>
    </div>
  );
}
