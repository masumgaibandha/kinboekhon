import { ProductGrid } from "@/components/shop/ProductGrid";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { CategoryGrid } from "@/components/shop/home/CategoryGrid";
import { Faq } from "@/components/shop/home/Faq";
import { HeroBanners } from "@/components/shop/home/HeroBanners";
import { HomeSection } from "@/components/shop/home/HomeSection";
import { TrustBar } from "@/components/shop/home/TrustBar";
import { WhyUs } from "@/components/shop/home/WhyUs";
import { getActiveBanners } from "@/lib/banners/shop";
import { getCategories } from "@/lib/categories/shop";
import { getHomeContent } from "@/lib/home/home-content";
import { getNewProducts, getPopularProducts } from "@/lib/product-lists";

// Without a banner the first product images are the largest on screen, so they load first.
const EAGER_WITHOUT_BANNER = 2;

export default async function HomePage() {
  const [banners, content, categories, popular, latest] = await Promise.all([
    getActiveBanners(),
    getHomeContent(),
    getCategories(),
    getPopularProducts(),
    getNewProducts(),
  ]);
  const eager = banners.length === 0 ? EAGER_WITHOUT_BANNER : 0;

  return (
    <>
      <h1 className="sr-only">কিনবো এখন: দরকার যখন, কিনবো এখন</h1>
      <HeroBanners banners={banners} />
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <TrustBar items={content.trust} />

        {categories.length > 0 && (
          <HomeSection title="ক্যাটাগরি">
            <CategoryGrid categories={categories} />
          </HomeSection>
        )}

        {popular.length > 0 && (
          <HomeSection title="জনপ্রিয় পণ্য">
            <ProductGrid products={popular} eager={eager} />
          </HomeSection>
        )}

        {latest.length > 0 ? (
          <HomeSection title="নতুন পণ্য">
            <ProductGrid products={latest} eager={popular.length === 0 ? eager : 0} />
          </HomeSection>
        ) : (
          <p className="mt-6 rounded-xl border border-line bg-card px-5 py-10 text-center text-desc">
            এই মুহূর্তে কোনো পণ্য নেই। শীঘ্রই নতুন পণ্য আসছে।
          </p>
        )}

        <WhyUs why={content.why} />
        <Faq faq={content.faq} />
      </div>
      <WhatsAppButton />
    </>
  );
}
