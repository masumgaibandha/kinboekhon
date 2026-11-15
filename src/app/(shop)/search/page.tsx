import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { SearchForm } from "@/components/shop/header/SearchForm";
import { searchProducts } from "@/lib/product-lists";

export const metadata: Metadata = { title: "পণ্য খুঁজুন", robots: { index: false } };

const MAX_QUERY = 60;

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-shop px-3 py-5 sm:px-4">
      <Suspense fallback={<p className="text-desc">খোঁজা হচ্ছে...</p>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
      <WhatsAppButton />
    </div>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim().slice(0, MAX_QUERY);
  const products = query ? await searchProducts(query) : [];

  return (
    <>
      <SearchForm key={query} defaultValue={query} className="border border-line-strong" />
      {query && (
        <h1 className="mt-5 text-lg font-bold text-heading">
          &ldquo;{query}&rdquo; এর ফলাফল: {products.length}টি পণ্য
        </h1>
      )}
      {!query ? (
        <p className="mt-5 text-desc">পণ্যের নাম লিখে খুঁজুন।</p>
      ) : products.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-card px-5 py-10 text-center text-desc">
          কোনো পণ্য পাওয়া যায়নি। অন্য নাম দিয়ে খুঁজে দেখুন।
        </p>
      ) : (
        <div className="mt-4">
          <ProductGrid products={products} />
        </div>
      )}
    </>
  );
}
