import { PriceTag } from "@/components/shop/PriceTag";
import { HeroMedia } from "@/components/shop/ad-landing/HeroMedia";
import { OrderButton } from "@/components/shop/landing/OrderButton";
import { TrustBadges } from "@/components/shop/landing/TrustBadges";
import type { LandingProduct } from "@/lib/catalog";
import { videoEmbed } from "@/lib/landing/video";
import type { LandingValues } from "@/lib/validation/landing";

interface AdHeroProps {
  product: LandingProduct;
  landing: LandingValues;
  soldOut: boolean;
}

export function AdHero({ product, landing, soldOut }: AdHeroProps) {
  const video = landing.heroVideoUrl ? videoEmbed(landing.heroVideoUrl) : null;

  return (
    <section className="bg-card px-5 pb-5 pt-[22px]">
      <h1 className="text-[28px] font-bold leading-[1.3] text-body sm:text-[30px]">{landing.headline || product.name}</h1>
      {landing.subheadline && <p className="mt-3 text-[17px] leading-relaxed text-desc">{landing.subheadline}</p>}

      <div className="mt-4">
        <HeroMedia image={landing.heroImage ?? product.images[0] ?? null} video={video} alt={product.name} />
      </div>

      <div className="mt-4 space-y-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-brand-dark">{product.name}</p>
          <PriceTag price={product.price} size="lg" />
        </div>
        <OrderButton soldOut={soldOut} />
        <TrustBadges />
      </div>
    </section>
  );
}
