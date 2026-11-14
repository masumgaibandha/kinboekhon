import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StickyOrderBar } from "@/components/shop/StickyOrderBar";
import { CtaSection } from "@/components/shop/landing/CtaSection";
import { HookSection } from "@/components/shop/landing/HookSection";
import { OrderButton } from "@/components/shop/landing/OrderButton";
import { ProblemSection } from "@/components/shop/landing/ProblemSection";
import { ProofSection, hasProof } from "@/components/shop/landing/ProofSection";
import { SolutionSection } from "@/components/shop/landing/SolutionSection";
import { StorySection } from "@/components/shop/landing/StorySection";
import { OrderForm } from "@/components/shop/order/OrderForm";
import { getActiveSlugs, getProductBySlug } from "@/lib/catalog";
import { enabledAccounts } from "@/lib/orders/payment-methods";
import { getSettings } from "@/lib/settings";

// The page awaits params outside Suspense, so unlisted slugs may block on their first render; the route is still prerendered.
export const instant = false;

// Cache Components needs at least one param; this one is never a valid slug, so it renders the 404 page.
const NO_ACTIVE_PRODUCT = "_none";

export async function generateStaticParams() {
  const slugs = await getActiveSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: NO_ACTIVE_PRODUCT }];
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "পণ্যটি পাওয়া যাচ্ছে না" };
  return { title: product.name, description: product.shortDescription || product.hook.subheadline || undefined };
}

// Inactive or unknown slug: the unavailable page, with noindex; cached visits return a 404 status.
export default async function ProductPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-xl">
      <HookSection product={product} />
      <ProblemSection problem={product.problem} />
      <StorySection story={product.story} />
      <SolutionSection solution={product.solution} name={product.name} />
      <ProofSection proof={product.proof} />
      {hasProof(product.proof) && (
        <div className="bg-card px-5 pb-5">
          <OrderButton />
        </div>
      )}
      <CtaSection product={product} />
      <OrderForm
        productId={product.id}
        price={product.price}
        fullAdvanceDiscount={settings.fullAdvanceDiscount}
        accounts={enabledAccounts(settings)}
      />
      <StickyOrderBar price={product.price} />
    </div>
  );
}
