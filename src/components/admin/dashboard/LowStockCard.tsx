import Link from "next/link";

import { StockLevelBadge } from "@/components/admin/stock/StockLevelBadge";
import type { LowStockProduct } from "@/lib/stock/stock-alerts";

export function LowStockCard({ products }: { products: LowStockProduct[] }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-heading">Low stock</h2>
      <div className="rounded-xl border border-line bg-card">
        {products.length === 0 ? (
          <p className="p-4 text-sm text-desc">Every active product is above its low-stock level.</p>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                <Link href={`/admin/products/${product.id}`} className="font-medium text-heading hover:text-brand hover:underline">
                  {product.name}
                </Link>
                <StockLevelBadge stock={product.stock} lowStockLevel={product.lowStockLevel} />
                <span className="ml-auto text-sm text-desc">
                  <span className="font-semibold text-heading">{product.stock}</span> in stock, alert at {product.lowStockLevel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
