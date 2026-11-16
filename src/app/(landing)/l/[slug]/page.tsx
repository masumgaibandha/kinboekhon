import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PriceTag } from "@/components/shop/PriceTag";
import { StickyOrderBar } from "@/components/shop/StickyOrderBar";
import { AdHero } from "@/components/shop/ad-landing/AdHero";
import { FaqBlock, GuaranteeBlock, InBoxBlock, SpecsBlock, StepsBlock } from "@/components/shop/ad-landing/AdInfoSections";
import { BenefitsBlock, GalleryBlock, ProblemBlock, SolutionBlock } from "@/components/shop/ad-landing/AdStorySections";
import { LandingSection } from "@/components/shop/landing/LandingSection";
import { OrderForm } from "@/components/shop/order/OrderForm";
import { SoldOutSection } from "@/components/shop/order/SoldOutSection";
import { HelpPopup } from "@/components/shop/help/HelpPopup";
import { ViewContentPixel } from "@/components/tracking/ViewContentPixel";
import { getLandingBySlug, getLandingSlugs } from "@/lib/landing/landing-pages";
import { enabledAccounts } from "@/lib/orders/payment-methods";
import { getSettings } from "@/lib/settings";
import { getUpsellProducts } from "@/lib/upsell";

// The page awaits params outside Suspense, so unlisted slugs may block on their first render; the route is still prerendered.
export const instant = false;

// Cache Components needs at least one param; this one is never a valid slug, so it renders the 404 page.
const NO_LANDING = "_none";

export async function generateStaticParams() {
  const slugs = await getLandingSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: NO_LANDING }];
}

// Ad pages are for paid traffic only, so search engines leave them out.
export async function generateMetadata({ params }: PageProps<"/l/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getLandingBySlug(slug);
  const title = found ? found.landing.headline || found.product.name : "পণ্যটি পাওয়া যাচ্ছে না";
  return { title, description: found?.landing.subheadline || undefined, robots: { index: false } };
}

export default async function AdLandingPage({ params }: PageProps<"/l/[slug]">) {
  const { slug } = await params;
  const found = await getLandingBySlug(slug);
  if (!found) notFound();
  const { product, landing } = found;
  const settings = await getSettings();
  const soldOut = settings.hideOrderWhenOutOfStock && !product.inStock;
  const upsells = soldOut ? [] : await getUpsellProducts(product.id, product.upsellIds, product.categoryId);

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-shop lg:px-4 lg:pt-6">
      <AdHero product={product} landing={landing} soldOut={soldOut} />
      <div className="lg:mx-auto lg:max-w-column">
        <ProblemBlock problem={landing.problem} />
        <SolutionBlock solution={landing.solution} />
        <BenefitsBlock benefits={landing.benefits} />
        <GalleryBlock gallery={landing.gallery} alt={product.name} />
        <StepsBlock howTo={landing.howTo} />
        <InBoxBlock inBox={landing.inBox} />
        <SpecsBlock specs={landing.specs} />
        <GuaranteeBlock text={landing.guarantee} />
        <FaqBlock faq={landing.faq} />
      </div>
      <div className={`lg:mx-auto ${soldOut ? "lg:max-w-form" : "lg:max-w-checkout"}`}>
        {/* From 1024px the order summary card shows the name and price instead. */}
        <LandingSection className={soldOut ? "" : "lg:hidden"}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[17px] font-semibold leading-snug text-heading">{product.name}</p>
            <PriceTag price={product.price} size="lg" />
          </div>
        </LandingSection>
        {soldOut ? (
          <SoldOutSection />
        ) : (
          <>
            <OrderForm
              productId={product.id}
              name={product.name}
              image={product.images[0] ?? null}
              price={product.price}
              pricing={{
                deliveryChargeDhakaCity: settings.deliveryChargeDhakaCity,
                deliveryChargeOutside: settings.deliveryChargeOutside,
                advanceDeliveryDiscount: settings.advanceDeliveryDiscount,
                fullAdvanceDiscount: settings.fullAdvanceDiscount,
              }}
              accounts={enabledAccounts(settings)}
              upsells={upsells}
            />
            <StickyOrderBar price={product.price} />
          </>
        )}
      </div>
      <ViewContentPixel productId={product.id} name={product.name} price={product.price} />
      <HelpPopup productId={product.id} />
    </div>
  );
}
