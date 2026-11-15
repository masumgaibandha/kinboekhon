import { AdjustmentForm } from "@/components/admin/stock/AdjustmentForm";
import { LowStockForm } from "@/components/admin/stock/LowStockForm";
import { PurchaseForm } from "@/components/admin/stock/PurchaseForm";
import { StockHistory } from "@/components/admin/stock/StockHistory";
import { StockLevelBadge } from "@/components/admin/stock/StockLevelBadge";
import { STOCK_HISTORY_LIMIT, type ProductStock } from "@/lib/stock/product-stock";

export function StockCard({ productId, stock }: { productId: string; stock: ProductStock }) {
  return (
    <section className="space-y-5 rounded-xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-heading">Stock</h2>
        <span className="text-2xl font-bold text-heading">{stock.stock}</span>
        <span className="text-sm text-desc">units in stock</span>
        <StockLevelBadge stock={stock.stock} lowStockLevel={stock.lowStockLevel} />
      </div>
      <p className="text-sm text-desc">Stock goes down when an order is sent to the courier and back up when a parcel is returned, unless its return reason is Damaged.</p>
      {/* Keyed on the level, so the form shows the saved value after every save. */}
      <LowStockForm key={stock.lowStockLevel} productId={productId} level={stock.lowStockLevel} />
      <div className="grid gap-6 border-t border-line pt-5 md:grid-cols-2">
        <PurchaseForm productId={productId} />
        <AdjustmentForm productId={productId} />
      </div>
      <div className="space-y-2 border-t border-line pt-5">
        <h3 className="font-semibold text-heading">Stock history</h3>
        <p className="text-xs text-muted">Newest first, the last {STOCK_HISTORY_LIMIT} moves.</p>
        <StockHistory moves={stock.moves} />
      </div>
    </section>
  );
}
