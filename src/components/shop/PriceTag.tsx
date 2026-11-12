import { discountPercent, formatTaka, toBanglaDigits } from "@/lib/money";

interface PriceTagProps {
  price: number;
  oldPrice: number | null;
  size?: "md" | "lg";
}

const SIZES = {
  md: { price: "text-lg", old: "text-sm", badge: "text-xs px-1.5", gap: "gap-x-2" },
  lg: { price: "text-[32px] leading-none", old: "text-lg", badge: "text-sm px-2", gap: "gap-x-3" },
};

export function PriceTag({ price, oldPrice, size = "md" }: PriceTagProps) {
  const discount = discountPercent(price, oldPrice);
  const style = SIZES[size];

  return (
    <div className={`flex flex-wrap items-baseline gap-y-1 ${style.gap}`}>
      <span className={`font-bold text-brand ${style.price}`}>{formatTaka(price)}</span>
      {discount > 0 && oldPrice !== null && (
        <>
          <span className={`text-muted line-through ${style.old}`}>{formatTaka(oldPrice)}</span>
          <span className={`rounded bg-brand-light py-0.5 font-semibold text-brand-dark ${style.badge}`}>
            {toBanglaDigits(discount)}% ছাড়
          </span>
        </>
      )}
    </div>
  );
}
