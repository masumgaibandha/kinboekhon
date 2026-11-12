import Link from "next/link";

import { ProductCard } from "@/components/shop/ProductCard";
import { getActiveProducts } from "@/lib/catalog";

const OTHER_PRODUCTS = 4;

export default async function ProductUnavailable() {
  const others = (await getActiveProducts()).slice(0, OTHER_PRODUCTS);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <section className="rounded-xl border border-line bg-card px-5 py-8 text-center">
        <h1 className="text-xl font-bold leading-snug text-heading">এই পণ্যটি এখন পাওয়া যাচ্ছে না</h1>
        <p className="mt-2 text-desc">পণ্যটি হয়তো আর বিক্রি হচ্ছে না, অথবা লিংকটি ভুল। আমাদের অন্য পণ্যগুলো দেখুন।</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-dark"
        >
          হোম পেজে যান
        </Link>
      </section>

      {others.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-heading">আমাদের অন্য পণ্য</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {others.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} eager={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
