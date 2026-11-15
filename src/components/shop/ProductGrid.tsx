import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductCardData } from "@/lib/catalog";

interface ProductGridProps {
  products: ProductCardData[];
  // How many first card images load at once with high priority.
  eager?: number;
}

export function ProductGrid({ products, eager = 0 }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} eager={index < eager} />
        </li>
      ))}
    </ul>
  );
}
