import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { getCategories, getCategoryBySlug } from "@/lib/categories/shop";
import { getCategoryProducts } from "@/lib/product-lists";
import { pageMetadata } from "@/lib/seo/page-metadata";

// The page awaits params outside Suspense, so unlisted slugs may block on their first render; the route is still prerendered.
export const instant = false;

// Cache Components needs at least one param; this one is never a valid slug, so it renders the 404 page.
const NO_CATEGORY = "_none";

const EAGER_IMAGES = 2;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.length > 0 ? categories.map(({ slug }) => ({ slug })) : [{ slug: NO_CATEGORY }];
}

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return pageMetadata({ title: "ক্যাটাগরি পাওয়া যাচ্ছে না", noindex: true });
  return pageMetadata({
    title: category.name,
    description: `${category.name}: পছন্দের পণ্য অর্ডার করুন। সারা দেশে হোম ডেলিভারি, ক্যাশ অন ডেলিভারি।`,
    path: `/c/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getCategoryProducts(category.id);

  return (
    <div className="mx-auto max-w-shop px-3 py-5 sm:px-4">
      <h1 className="text-xl font-bold text-heading">{category.name}</h1>
      {products.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-card px-5 py-10 text-center text-desc">
          এই ক্যাটাগরিতে এখন কোনো পণ্য নেই। শীঘ্রই নতুন পণ্য আসছে।
        </p>
      ) : (
        <div className="mt-4">
          <ProductGrid products={products} eager={EAGER_IMAGES} />
        </div>
      )}
      <WhatsAppButton />
    </div>
  );
}
