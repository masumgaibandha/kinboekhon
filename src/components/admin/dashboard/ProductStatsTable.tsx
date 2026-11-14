import { Money } from "@/components/ui/Money";
import type { ProductStat } from "@/lib/orders/stats";

export function ProductStatsTable({ products }: { products: ProductStat[] }) {
  if (products.length === 0) {
    return <p className="rounded-xl border border-line bg-card p-6 text-desc">No orders in this period.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs font-medium text-muted">
          <tr>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2 text-right">Orders</th>
            <th className="px-4 py-2 text-right">Sales</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId} className="border-b border-line last:border-0">
              <td className="px-4 py-2 text-body">{product.name}</td>
              <td className="px-4 py-2 text-right text-body">{product.orders}</td>
              <td className="px-4 py-2 text-right text-body">
                <Money amount={product.sales} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
