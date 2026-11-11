import { ProductCard } from "@/components/shop/ProductCard";
import { getActiveProducts } from "@/lib/catalog";

const EAGER_IMAGES = 2;

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <h1 className="text-lg font-bold text-heading">আমাদের পণ্য</h1>

      {products.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-card px-5 py-10 text-center text-desc">
          এই মুহূর্তে কোনো পণ্য নেই। শীঘ্রই নতুন পণ্য আসছে।
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} eager={index < EAGER_IMAGES} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
