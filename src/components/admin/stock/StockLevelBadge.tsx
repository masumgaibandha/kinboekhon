// Out of stock at 0 or less, Low at the product's alert level or less.
export function StockLevelBadge({ stock, lowStockLevel }: { stock: number; lowStockLevel: number }) {
  if (stock <= 0) return <OutOfStockBadge />;
  if (stock > lowStockLevel) return null;
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
      Low stock
    </span>
  );
}

export function OutOfStockBadge() {
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-brand-dark px-2.5 py-0.5 text-xs font-semibold text-white">
      Out of stock
    </span>
  );
}
