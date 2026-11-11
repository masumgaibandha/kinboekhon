import { discountPercent, formatTaka, toBanglaDigits } from "@/lib/money";

interface PriceTagProps {
  price: number;
  oldPrice: number | null;
}

export function PriceTag({ price, oldPrice }: PriceTagProps) {
  const discount = discountPercent(price, oldPrice);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-lg font-bold text-brand">{formatTaka(price)}</span>
      {discount > 0 && oldPrice !== null && (
        <>
          <span className="text-sm text-muted line-through">{formatTaka(oldPrice)}</span>
          <span className="rounded bg-brand-light px-1.5 py-0.5 text-xs font-semibold text-brand-dark">
            {toBanglaDigits(discount)}% ছাড়
          </span>
        </>
      )}
    </div>
  );
}
